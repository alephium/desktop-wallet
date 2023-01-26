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

import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAddressesContext } from '@/contexts/addresses'
import { AddressHash } from '@/types/addresses'
import { openInWebBrowser } from '@/utils/misc'

import { useAppSelector } from './redux'

const useAddressLinkHandler = () => {
  const { explorerUrl } = useAppSelector((state) => state.network.settings)
  const { getAddress } = useAddressesContext()
  const navigate = useNavigate()

  return useCallback(
    (addressHash: AddressHash) => {
      if (!addressHash) return

      const address = getAddress(addressHash)

      if (address) {
        navigate(`/wallet/addresses/${addressHash}`)
      } else {
        openInWebBrowser(`${explorerUrl}/#/addresses/${addressHash}`)
      }
    },
    [navigate, getAddress, explorerUrl]
  )
}

export default useAddressLinkHandler
