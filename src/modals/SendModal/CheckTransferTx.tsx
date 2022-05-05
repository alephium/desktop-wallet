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

import { BuildTransferTxData } from './BuildTransferTx'
import {
  AlphAmountInfo,
  CheckTxFooter,
  CheckTxProps,
  expectedAmount,
  FeeInfo,
  FromAddressInfo,
  ModalContent,
  ToAddressInfo
} from './utils'

const CheckTransferTx = ({ data, fees, onSend, onCancel }: CheckTxProps<BuildTransferTxData>) => {
  return (
    <>
      <ModalContent>
        <FromAddressInfo fromAddress={data.fromAddress} />
        <ToAddressInfo toAddress={data.toAddress} />
        <AlphAmountInfo expectedAmount={expectedAmount(data, fees)} />
        <FeeInfo fees={fees} />
      </ModalContent>
      <CheckTxFooter onSend={onSend} onCancel={onCancel} />
    </>
  )
}

export default CheckTransferTx
