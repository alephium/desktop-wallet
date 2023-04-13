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
import { IntervalType } from '@alephium/sdk/api/explorer'
import { colord } from 'colord'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import Chart from 'react-apexcharts'

import client from '@/api/client'
import { useGetHistoricalPriceQuery } from '@/storage/assets/priceApiSlice'
import { AddressHash } from '@/types/addresses'
import { Currency } from '@/types/settings'

interface HistoricalPriceChartProps {
  addressHashes: AddressHash[]
  currency: Currency
}

type DateString = string
type AmountPerDate = Record<DateString, bigint>
type AmountPerDatePerAddress = Record<AddressHash, AmountPerDate>
type LatestAmountPerAddress = Record<AddressHash, bigint>

const HistoricalPriceChart = ({ addressHashes, currency }: HistoricalPriceChartProps) => {
  const [amountPerDatePerAddress, setAmountPerDatePerAddress] = useState<AmountPerDatePerAddress>()
  const { data: alphPriceHistory } = useGetHistoricalPriceQuery({
    currency,
    days: 91
  })

  useEffect(() => {
    if (addressHashes.length === 0) return

    const amountPerDatePerAddressTemp: AmountPerDatePerAddress = {}
    addressHashes.forEach((addressHash) => (amountPerDatePerAddressTemp[addressHash] = {}))

    const fetchData = async () => {
      const now = dayjs()
      const thisMoment = now.valueOf()
      const threeMonthsAgo = now.subtract(3, 'month').valueOf()

      for (const addressHash of addressHashes) {
        const { data } = await client.explorer.addresses.getAddressesAddressAmountHistory(
          addressHash,
          { fromTs: threeMonthsAgo, toTs: thisMoment, 'interval-type': IntervalType.Daily },
          { format: 'text' }
        )

        data.split('\n').forEach((row, index) => {
          if (index !== 0 && row) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const [timestamp, _, amount] = row.split(',')
            const date = dayjs(parseInt(timestamp)).format('YYYY-MM-DD')

            amountPerDatePerAddressTemp[addressHash][date] = BigInt(amount)
          }
        })
      }

      setAmountPerDatePerAddress(amountPerDatePerAddressTemp)
    }

    fetchData()
  }, [addressHashes])

  if (!alphPriceHistory || !amountPerDatePerAddress) return null

  const addressesLatestAmount: LatestAmountPerAddress = {}
  addressHashes.forEach((addressHash) => (addressesLatestAmount[addressHash] = BigInt(0)))

  const chartData = alphPriceHistory.map(({ date, price }) => {
    let totalAmountPerDate = BigInt(0)

    addressHashes.forEach((addressHash) => {
      const amountOnDate = amountPerDatePerAddress[addressHash][date]

      if (amountOnDate !== undefined) {
        totalAmountPerDate += amountOnDate
        addressesLatestAmount[addressHash] = amountOnDate
      } else {
        totalAmountPerDate += addressesLatestAmount[addressHash]
      }
    })

    // TODO: Uncomment to test the display of date, sometimes it works, sometimes the chart doesn't show :/
    // return {
    //   x: date,
    //   y: price * parseFloat(toHumanReadableAmount(totalAmountPerDate))
    // }
    return price * parseFloat(toHumanReadableAmount(totalAmountPerDate))
  })

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

export default HistoricalPriceChart
