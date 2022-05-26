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

import { Address, useAddressesContext } from '../../contexts/addresses'
import { SendTxModalType } from '../../contexts/sendTransactionModal'
import { useWalletConnectContext } from '../../contexts/walletconnect'
import DeployContractTxModal from './DeployContractTxModal'
import ScriptTxModal from './ScriptTxModal'
import TransferTxModal from './TransferTxModal'

export type Step = 'send' | 'info-check' | 'password-check'

export const stepToTitle: { [k in Step]: string } = {
  send: 'Send',
  'info-check': 'Review',
  'password-check': 'Password Check'
}
type TxModalProps = {
  txModalType: SendTxModalType
  onClose: () => void
}

const SendModal = ({ txModalType, onClose }: TxModalProps) => {
  const { mainAddress } = useAddressesContext()
  const { dappTxData } = useWalletConnectContext()

  if (!dappTxData && !mainAddress) return null

  const txData = dappTxData ?? { fromAddress: mainAddress as Address }

  return {
    transfer: <TransferTxModal initialTxData={txData} onClose={onClose} />,
    'deploy-contract': <DeployContractTxModal initialTxData={txData} onClose={onClose} />,
    script: <ScriptTxModal initialTxData={txData} onClose={onClose} />
  }[txModalType]
}

export default SendModal
