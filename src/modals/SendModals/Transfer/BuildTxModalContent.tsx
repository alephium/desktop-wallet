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
import { useState } from 'react'

import { TransferTxData } from '../../../types/transactions'
import { isAddressValid } from '../../../utils/addresses'
import { isAmountWithinRange } from '../../../utils/transactions'
import { ModalContent, PartialTxData, SendTxModalFooterButtons, ToAddressInput, useBuildTxCommon } from '../utils'

export interface BuildTransferTxProps {
  data: PartialTxData<TransferTxData, 'fromAddress'>
  onSubmit: (data: TransferTxData) => void
  onCancel: () => void
}

const BuildTransferTx = ({ data, onSubmit, onCancel }: BuildTransferTxProps) => {
  const [
    fromAddress,
    FromAddressSelect,
    alphAmount,
    AlphAmountInput,
    gasAmount,
    gasPrice,
    GasSettingsExpandableSection,
    isCommonReady
  ] = useBuildTxCommon(data.fromAddress, data.alphAmount, data.gasAmount, data.gasPrice)
  const [toAddress, setToAddress] = useStateWithError(data?.toAddress ?? '')

  const handleAddressChange = (value: string) => {
    setToAddress(value, isAddressValid(value) ? '' : 'Address format is incorrect')
  }

  if (fromAddress === undefined) {
    onCancel()
    return <></>
  }

  const isSubmitButtonActive =
    isCommonReady &&
    toAddress.value &&
    !toAddress.error &&
    alphAmount &&
    isAmountWithinRange(convertAlphToSet(alphAmount), fromAddress.availableBalance)

  return (
    <>
      <ModalContent>
        {FromAddressSelect}
        <ToAddressInput toAddress={toAddress} handleAddressChange={handleAddressChange} />
        {AlphAmountInput}
      </ModalContent>
      {GasSettingsExpandableSection}
      <SendTxModalFooterButtons
        onSubmit={() =>
          onSubmit({
            fromAddress: fromAddress,
            toAddress: toAddress.value,
            alphAmount: alphAmount,
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

export default BuildTransferTx

function useStateWithError<T>(initialValue: T) {
  const [value, setValue] = useState({ value: initialValue, error: '' })

  const setValueWithError = (newValue: T, newError: string) => {
    setValue({ value: newValue, error: newError })
  }

  return [value, setValueWithError] as const
}
