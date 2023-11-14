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

import { Asset } from '@alephium/sdk'
import { createApi, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react'
import dayjs from 'dayjs'
import { uniq } from 'lodash'

import { Currency } from '@/types/settings'
import { CHART_DATE_FORMAT } from '@/utils/constants'

export interface HistoricalPrice {
  date: string // CHART_DATE_FORMAT
  price: number
}

interface MarketChartEnpointResult {
  market_caps: [number, number][] // date, value
  prices: [number, number][]
  total_volumes: [number, number][]
}

// TODO: EXPORT TO SHARED LIB
export type CoinGeckoID = 'alephium' | 'tether' | 'usdc' | 'dai' | 'ethereum' | 'wrapped-bitcoin'

export const symbolCoinGeckoMapping: { [key: string]: CoinGeckoID } = {
  ALPH: 'alephium',
  USDT: 'tether',
  USDC: 'usdc',
  DAI: 'dai',
  WETH: 'ethereum',
  WBTC: 'wrapped-bitcoin'
}

export const getTokensApiIds = (tokens: Asset[]) =>
  uniq(tokens.flatMap((t) => (t.symbol && symbolCoinGeckoMapping[t.symbol] ? symbolCoinGeckoMapping[t.symbol] : [])))

type HistoricalPriceQueryParams = {
  assetIds: CoinGeckoID[]
  currency: Currency
  days: number
}

export const priceApi = createApi({
  reducerPath: 'priceApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.coingecko.com/api/v3/' }),
  endpoints: (builder) => ({
    getPrices: builder.query<
      { [id in CoinGeckoID]: number } | undefined,
      { assets?: CoinGeckoID[]; currency: Currency }
    >({
      query: ({ assets, currency }) => `/simple/price?ids=${assets?.join(',')}&vs_currencies=${currency.toLowerCase()}`,
      transformResponse: (response: { [key in CoinGeckoID]: { [key: string]: string } }, meta, arg) => {
        if (!arg.assets) return undefined

        const currency = arg.currency.toLowerCase()

        return Object.entries(response).reduce(
          (acc, [id, price]) => ({ ...acc, [id]: parseFloat(price[currency]) }),
          {} as { [id in CoinGeckoID]: number }
        )
      }
    }),
    getHistoricalPrice: builder.query<{ [id in CoinGeckoID]: HistoricalPrice[] }, HistoricalPriceQueryParams>({
      queryFn: async ({ assetIds, currency, days }, _queryApi, _extraOptions, fetchWithBQ) => {
        const results = (await Promise.all(
          assetIds.map((id) =>
            fetchWithBQ(`/coins/${id}/market_chart?vs_currency=${currency.toLowerCase()}&days=${days}`)
          )
        )) as { data: MarketChartEnpointResult; error?: string }[]

        const today = dayjs().format(CHART_DATE_FORMAT)

        const errors = results.filter((r) => !!r.error)

        if (errors.length > 0) return { error: { error: errors.join(', ') } as FetchBaseQueryError }

        return {
          data: results.reduce(
            (acc, { data: { prices } }, i) => ({
              ...acc,
              [assetIds[i]]: prices.reduce((acc, [date, price]) => {
                const itemDate = dayjs(date).format(CHART_DATE_FORMAT)
                const isDuplicatedItem = !!acc.find(({ date }) => dayjs(date).format(CHART_DATE_FORMAT) === itemDate)

                if (!isDuplicatedItem && itemDate !== today)
                  acc.push({
                    date: itemDate,
                    price
                  })

                return acc
              }, [] as HistoricalPrice[])
            }),
            {} as { [id in CoinGeckoID]: HistoricalPrice[] }
          )
        }
      }
    })
  })
})

export const { useGetPricesQuery, useGetHistoricalPriceQuery } = priceApi
