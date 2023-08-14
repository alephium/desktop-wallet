/*
Copyright 2018 - 2023 The Alephium Authors
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

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import dayjs from 'dayjs'

import { Currency } from '@/types/settings'
import { CHART_DATE_FORMAT } from '@/utils/constants'

type HistoricalPriceQueryParams = {
  currency: Currency
  days: number
}

interface HistoricalPriceResult {
  date: string // CHART_DATE_FORMAT
  price: number
}

export const priceApi = createApi({
  reducerPath: 'priceApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.coingecko.com/api/v3/' }),
  endpoints: (builder) => ({
    getPrice: builder.query<number, Currency>({
      query: (currency) => `/simple/price?ids=alephium&vs_currencies=${currency.toLowerCase()}`,
      transformResponse: (response: { alephium: { [key: string]: string } }, meta, arg) => {
        const currency = arg.toLowerCase()
        const price = response.alephium[currency]

        return parseFloat(price)
      }
    }),
    getHistoricalPrice: builder.query<HistoricalPriceResult[], HistoricalPriceQueryParams>({
      query: ({ currency, days }) => `/coins/alephium/market_chart?vs_currency=${currency.toLowerCase()}&days=${days}`,
      transformResponse: (response: { prices: number[][] }) => {
        const { prices } = response
        const today = dayjs().format(CHART_DATE_FORMAT)

        return prices
          .filter(([date]) => dayjs(date).format(CHART_DATE_FORMAT) !== today)
          .map(([date, price]) => ({ date: dayjs(date).format(CHART_DATE_FORMAT), price }))
      }
    })
  })
})

export const { useGetPriceQuery, useGetHistoricalPriceQuery } = priceApi
