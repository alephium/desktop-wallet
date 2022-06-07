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

import { convertAlphToSet } from '@alephium/sdk'

import { DeployContractTxData } from '../../../types/transactions'
import { isAmountWithinRange } from '../../../utils/transactions'
import {
  ModalContent,
  PartialTxData,
  SendTxModalFooterButtons,
  useBuildTxCommon,
  useBytecode,
  useIssueTokenAmount
} from '../utils'

export interface DeployContractBuildTxModalContentProps {
  data: PartialTxData<DeployContractTxData, 'fromAddress'>
  onSubmit: (data: DeployContractTxData) => void
  onCancel: () => void
}

const DeployContractBuildTxModalContent = ({ data, onSubmit, onCancel }: DeployContractBuildTxModalContentProps) => {
  const [
    fromAddress,
    FromAddressSelect,
    alphAmount,
    AlphAmountInput,
    gasAmount,
    gasPrice,
    GasSettingsExpandableSection,
    isCommonReady
  ] = useBuildTxCommon(data.fromAddress, data.initialAlphAmount, data.gasAmount, data.gasPrice)
  const [bytecode, BytecodeInput] = useBytecode(data.bytecode ?? '')
  const [issueTokenAmount, IssueTokenAmount] = useIssueTokenAmount(data.issueTokenAmount ?? '')

  if (fromAddress === undefined) {
    onCancel()
    return <></>
  }

  const isSubmitButtonActive =
    isCommonReady &&
    bytecode &&
    (!alphAmount || isAmountWithinRange(convertAlphToSet(alphAmount), fromAddress.availableBalance))

  return (
    <>
      <ModalContent>
        {FromAddressSelect}
        {BytecodeInput}
        {AlphAmountInput}
        {IssueTokenAmount}
      </ModalContent>
      {GasSettingsExpandableSection}
      <SendTxModalFooterButtons
        onSubmit={() =>
          onSubmit({
            fromAddress: data.fromAddress,
            bytecode: bytecode,
            issueTokenAmount: issueTokenAmount ? issueTokenAmount : undefined,
            initialAlphAmount: alphAmount ? alphAmount : undefined,
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

export default DeployContractBuildTxModalContent
