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

// TODO: EXPORT TO SHARED LIB
type CoinGeckoID = 'alephium' | 'tether' | 'usdc' | 'dai' | 'ethereum' | 'wrapped-bitcoin'

export const symbolCoinGeckoMapping: { [key: string]: CoinGeckoID } = {
  ALPH: 'alephium',
  USDT: 'tether',
  USDC: 'usdc',
  DAI: 'dai',
  WETH: 'ethereum',
  WBTC: 'wrapped-bitcoin'
}

export const priceApi = createApi({
  reducerPath: 'priceApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.coingecko.com/api/v3/' }),
  endpoints: (builder) => ({
    getPrice: builder.query<number, { asset?: CoinGeckoID; currency: Currency }>({
      query: ({ asset, currency }) => `/simple/price?ids=${asset}&vs_currencies=${currency.toLowerCase()}`,
      transformResponse: (response: { [key in CoinGeckoID]: { [key: string]: string } }, meta, arg) => {
        if (!arg.asset) return NaN

        const currency = arg.currency.toLowerCase()
        const price = response[arg.asset][currency]

        return parseFloat(price)
      }
    }),
    getPrices: builder.query<
      { [id in CoinGeckoID]: number } | undefined,
      { assets?: CoinGeckoID[]; currency: Currency }
    >({
      query: ({ assets, currency }) =>
        `/simple/price?ids=${assets?.reduce((a, acc) => `${a},${acc}`, '')}&vs_currencies=${currency.toLowerCase()}`,
      transformResponse: (response: { [key in CoinGeckoID]: { [key: string]: string } }, meta, arg) => {
        if (!arg.assets) return undefined

        const currency = arg.currency.toLowerCase()

        return Object.entries(response).reduce(
          (acc, [id, price]) => ({ ...acc, [id]: parseFloat(price[currency]) }),
          {} as { [id in CoinGeckoID]: number }
        )
      }
    }),
    getHistoricalPrice: builder.query<HistoricalPriceResult[], HistoricalPriceQueryParams>({
      query: ({ currency, days }) => `/coins/alephium/market_chart?vs_currency=${currency.toLowerCase()}&days=${days}`,
      transformResponse: (response: { prices: number[][] }) => {
        const { prices } = response
        const today = dayjs().format(CHART_DATE_FORMAT)

        return prices.reduce((acc, [date, price]) => {
          const itemDate = dayjs(date).format(CHART_DATE_FORMAT)
          const isDuplicatedItem = !!acc.find(({ date }) => dayjs(date).format(CHART_DATE_FORMAT) === itemDate)

          if (!isDuplicatedItem && itemDate !== today)
            acc.push({
              date: itemDate,
              price
            })

          return acc
        }, [] as HistoricalPriceResult[])
      }
    })
  })
})

export const { useGetPriceQuery, useGetPricesQuery, useGetHistoricalPriceQuery } = priceApi
