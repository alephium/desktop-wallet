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
import Chart from 'react-apexcharts'

import { useAppSelector } from '@/hooks/redux'
import { selectAddresses } from '@/storage/addresses/addressesSelectors'
import { useGetHistoricalPriceQuery } from '@/storage/assets/priceApiSlice'
import { AddressHash } from '@/types/addresses'
import { Currency } from '@/types/settings'

interface HistoricWorthChartProps {
  addressHashes: AddressHash[]
  currency: Currency
}

type LatestAmountPerAddress = Record<AddressHash, bigint>

const HistoricWorthChart = ({ addressHashes, currency }: HistoricWorthChartProps) => {
  const addresses = useAppSelector((s) => selectAddresses(s, addressHashes))
  const { data: alphPriceHistory } = useGetHistoricalPriceQuery({ currency, days: 365 })

  if (!alphPriceHistory || addressHashes.length === 0) return null

  const computeChartDataPoints = () => {
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

      // TODO: Uncomment to test the display of date, sometimes it works, sometimes the chart doesn't show :/
      // return {
      //   x: date,
      //   y: price * parseFloat(toHumanReadableAmount(totalAmountPerDate))
      // }
      return price * parseFloat(toHumanReadableAmount(totalAmountPerDate))
    })
  }

  const chartData = computeChartDataPoints()
  const filteredChartData = chartData.slice(chartData.findIndex((point) => point !== 0))

  return <Chart options={chartOptions} series={[{ data: filteredChartData }]} type="area" width="100%" height="100%" />
}

const chartOptions: ApexCharts.ApexOptions = {
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
    }
  },
  xaxis: {
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
    colors: ['#3ED282'],
    width: 2
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
            color: colord('#3ED282').alpha(0.5).toHex()
          },
          {
            offset: 100,
            color: colord('#3ED282').alpha(0).toHex()
          }
        ]
      ]
    }
  }
}

export default HistoricWorthChart
