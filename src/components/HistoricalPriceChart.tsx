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

import { colord } from 'colord'
import Chart from 'react-apexcharts'

import { useGetHistoricalPriceQuery } from '@/storage/assets/priceApiSlice'
import { Currency } from '@/types/settings'
import { currencies } from '@/utils/currencies'

interface HistoricalPriceChartProps {
  currency: Currency
}

const HistoricalPriceChart = ({ currency }: HistoricalPriceChartProps) => {
  const { data: prices, isLoading: pricesLoading } = useGetHistoricalPriceQuery(currencies.USD.ticker)

  if (!prices) return null

  return (
    <Chart
      options={chartOptions}
      series={[{ data: prices.map((p) => p.price) }]}
      type="area"
      width="100%"
      height="100%"
    />
  )
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
