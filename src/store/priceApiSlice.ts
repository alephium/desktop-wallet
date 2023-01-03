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

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { Currency } from '@/types/settings'

export const priceApi = createApi({
  reducerPath: 'priceApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.coingecko.com/api/v3/simple/' }),
  endpoints: (builder) => ({
    getPrice: builder.query<number, Currency>({
      query: (currency) => `/price?ids=alephium&vs_currencies=${currency.toLowerCase()}`,
      transformResponse: (response: { alephium: { [key: string]: string } }, meta, arg) => {
        const currency = arg.toLowerCase()
        const price = response.alephium[currency]

        return parseFloat(price)
      }
    })
  })
})

export const { useGetPriceQuery } = priceApi
