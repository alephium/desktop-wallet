/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { toHumanReadableAmount } from '@alephium/sdk'
import { colord } from 'colord'
import dayjs, { Dayjs } from 'dayjs'
import { memo } from 'react'
import Chart from 'react-apexcharts'
import { useTheme } from 'styled-components'

import { useAppSelector } from '@/hooks/redux'
import { selectAddresses } from '@/storage/addresses/addressesSelectors'
import { useGetHistoricalPriceQuery } from '@/storage/assets/priceApiSlice'
import { AddressHash } from '@/types/addresses'
import { ChartLength, DataPoint, LatestAmountPerAddress } from '@/types/chart'
import { Currency } from '@/types/settings'

interface HistoricWorthChartProps {
  addressHashes: AddressHash[]
  currency: Currency
  onDataPointHover: (dataPoint?: DataPoint) => void
  length: ChartLength
}

const now = dayjs()
const startingDates: Record<ChartLength, Dayjs> = {
  '1w': now.subtract(1, 'week'),
  '1m': now.subtract(1, 'month'),
  '1y': now.subtract(1, 'year')
}

// Note: It's necessary to wrap in memo, otherwise the chart rerenders everytime onDataPointHover is called because the
// state of the parent component changes
const HistoricWorthChart = memo(function HistoricWorthChart({
  addressHashes,
  currency,
  onDataPointHover,
  length = '1y'
}: HistoricWorthChartProps) {
  const addresses = useAppSelector((s) => selectAddresses(s, addressHashes))
  const { data: alphPriceHistory } = useGetHistoricalPriceQuery({ currency, days: 365 })
  const theme = useTheme()

  const startingDate = startingDates[length].format('YYYY-MM-DD')

  if (!alphPriceHistory || addressHashes.length === 0) return null

  const computeChartDataPoints = (): DataPoint[] => {
    const addressesLatestAmount: LatestAmountPerAddress = {}
    addresses.forEach(({ hash }) => (addressesLatestAmount[hash] = BigInt(0)))

    return alphPriceHistory.map(({ date, price }) => {
      let totalAmountPerDate = BigInt(0)

      addresses.forEach(({ hash, balanceHistory }) => {
        const amountOnDate = balanceHistory.entities[date]?.balance

        if (amountOnDate !== undefined) {
          const amount = BigInt(amountOnDate)
          totalAmountPerDate += amount
          addressesLatestAmount[hash] = amount
        } else {
          totalAmountPerDate += addressesLatestAmount[hash]
        }
      })

      return {
        x: date,
        y: price * parseFloat(toHumanReadableAmount(totalAmountPerDate))
      }
    })
  }

  const chartData = computeChartDataPoints()
  let filteredChartData = chartData.slice(chartData.findIndex((point) => point.y !== 0))

  const startingPoint = filteredChartData.findIndex((point) => point.x === startingDate)
  filteredChartData = startingPoint > 0 ? filteredChartData.slice(startingPoint) : filteredChartData

  if (filteredChartData.length === 1 && filteredChartData[0].y === 0) return null

  const lastItem = filteredChartData.at(-1)
  const chartColor = lastItem !== undefined && filteredChartData[0].y < lastItem.y ? '#3ED282' : theme.global.alert

  const chartOptions = getChartOptions(chartColor, {
    mouseMove(e, chart, options) {
      onDataPointHover(options.dataPointIndex === -1 ? undefined : filteredChartData[options.dataPointIndex])
    },
    mouseLeave() {
      onDataPointHover(undefined)
    }
  })

  return <Chart options={chartOptions} series={[{ data: filteredChartData }]} type="area" width="100%" height="100%" />
})

export default HistoricWorthChart

const getChartOptions = (chartColor: string, events: ApexChart['events']): ApexCharts.ApexOptions => ({
  chart: {
    id: 'alephium-chart',
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    },
    sparkline: {
      enabled: true
    },
    events
  },
  xaxis: {
    type: 'datetime',
    axisTicks: {
      show: false
    },
    axisBorder: {
      show: false
    },
    tooltip: {
      enabled: false
    },
    labels: {
      show: false
    }
  },
  yaxis: {
    show: false
  },
  grid: {
    show: false,
    padding: {
      left: 0,
      right: 0
    }
  },
  stroke: {
    curve: 'smooth',
    colors: [chartColor],
    width: 2
  },
  tooltip: {
    custom: () => null,
    fixed: {
      enabled: true
    }
  },
  markers: {
    colors: [chartColor],
    strokeColors: [chartColor]
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      type: 'vertical',
      colorStops: [
        [
          {
            offset: 0,
            color: colord(chartColor).alpha(0.5).toHex()
          },
          {
            offset: 100,
            color: colord(chartColor).alpha(0).toHex()
          }
        ]
      ]
    }
  }
})
