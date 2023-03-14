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

import { useWalletConnectContext } from '@/contexts/walletconnect'
import { useAppSelector } from '@/hooks/redux'
import { selectDefaultAddress } from '@/storage/addresses/addressesSlice'
import { Address } from '@/types/addresses'

const useDappTxData = () => {
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const { dappTxData } = useWalletConnectContext()

  return dappTxData ?? { fromAddress: defaultAddress as Address }
}

export default useDappTxData
