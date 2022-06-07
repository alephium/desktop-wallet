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

import { ScriptTxData } from '../../../types/transactions'
import {
  AlphAmountInfo,
  BytecodeInfo,
  CheckTxFooter,
  CheckTxProps,
  expectedAmount,
  FeeInfo,
  FromAddressInfo,
  ModalContent
} from '../utils'

const ScriptCheckTxModalContent = ({ data, fees, onSend, onCancel }: CheckTxProps<ScriptTxData>) => (
  <>
    <ModalContent>
      <FromAddressInfo fromAddress={data.fromAddress} />
      <BytecodeInfo bytecode={data.bytecode} />
      <AlphAmountInfo expectedAmount={expectedAmount(data, fees)} />
      <FeeInfo fees={fees} />
    </ModalContent>
    <CheckTxFooter onSend={onSend} onCancel={onCancel} />
  </>
)

export default ScriptCheckTxModalContent
