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

import { AddressHash, useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import { openInWebBrowser } from '../utils/misc'

const useAddressLinkHandler = () => {
  const {
    settings: {
      network: { explorerUrl }
    }
  } = useGlobalContext()
  const { getAddress } = useAddressesContext()
  const navigate = useNavigate()

  return useCallback(
    (addressHash: AddressHash) => {
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
