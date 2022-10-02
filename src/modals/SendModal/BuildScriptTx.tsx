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

import { Number256 } from '@alephium/web3'

import { Address } from '../../contexts/addresses'
import { isAmountWithinRange } from '../../utils/transactions'
import { ModalContent, PartialTxData, SubmitOrCancel, useBuildTxCommon, useBytecode } from './utils'

export interface BuildScriptTxData {
  fromAddress: Address
  bytecode: string

  attoAlphAmount?: Number256
  gasAmount?: number
  gasPrice?: Number256
}

export interface BuildScriptTxProps {
  data: PartialTxData<BuildScriptTxData, 'fromAddress'>
  onSubmit: (data: BuildScriptTxData) => void
  onCancel: () => void
}

const BuildScriptTx = ({ data, onSubmit, onCancel }: BuildScriptTxProps) => {
  const [fromAddress, FromAddress, attoAlphAmount, AlphAmount, gasAmount, gasPrice, GasSettings, isCommonReady] =
    useBuildTxCommon(data.fromAddress, data.attoAlphAmount, data.gasAmount, data.gasPrice)
  const [bytecode, Bytecode] = useBytecode(data.bytecode ?? '')

  if (typeof fromAddress === 'undefined') {
    onCancel()
    return <></>
  }

  const isSubmitButtonActive =
    isCommonReady &&
    bytecode &&
    (!attoAlphAmount || isAmountWithinRange(BigInt(attoAlphAmount), fromAddress.availableBalance))

  return (
    <>
      <ModalContent>
        {FromAddress}
        {AlphAmount}
        {Bytecode}
      </ModalContent>
      {GasSettings}
      <SubmitOrCancel
        onSubmit={() =>
          onSubmit({
            fromAddress: data.fromAddress,
            bytecode: bytecode,
            attoAlphAmount: attoAlphAmount,
            gasAmount: gasAmount.parsed,
            gasPrice: gasPrice.parsed
          })
        }
        onCancel={onCancel}
        isSubmitButtonActive={isSubmitButtonActive}
      />
    </>
  )
}

export default BuildScriptTx
