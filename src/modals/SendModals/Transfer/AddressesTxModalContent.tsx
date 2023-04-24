/*
Copyright 2018 - 2023 The Alephium Authors
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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import FooterButton from '@/components/Buttons/FooterButton'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import { useAppSelector } from '@/hooks/redux'
import { ModalContent } from '@/modals/CenteredModal'
import AddressInputs from '@/modals/SendModals/AddressInputs'
import { selectAddressesWithSomeBalance } from '@/storage/addresses/addressesSelectors'
import { PartialTxData, TransferTxData } from '@/types/transactions'
import { isAddressValid, requiredErrorMessage } from '@/utils/form-validation'

interface TransferAddressesTxModalContentProps {
  data: PartialTxData<TransferTxData, 'fromAddress'>
  onSubmit: (data: PartialTxData<TransferTxData, 'fromAddress' | 'toAddress'>) => void
  onCancel: () => void
}

const TransferAddressesTxModalContent = ({ data, onSubmit, onCancel }: TransferAddressesTxModalContentProps) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAddressesWithSomeBalance)

  const [fromAddress, setFromAddress] = useState(data.fromAddress)
  const [toAddress, setToAddress] = useStateWithError(data?.toAddress ?? '')

  const handleToAddressChange = (value: string) => {
    setToAddress(value, !value ? requiredErrorMessage : isAddressValid(value) ? '' : t('This address is not valid'))
  }

  if (fromAddress === undefined) {
    onCancel()
    return null
  }

  const isSubmitButtonActive = toAddress.value && !toAddress.error

  return (
    <ModalContent>
      <InputFieldsColumn>
        <AddressInputs
          defaultFromAddress={fromAddress}
          fromAddresses={addresses}
          onFromAddressChange={setFromAddress}
          hideFromAddressesWithoutAssets
          toAddress={toAddress}
          onToAddressChange={handleToAddressChange}
          onContactSelect={handleToAddressChange}
        />
      </InputFieldsColumn>
      <FooterButton
        onClick={() =>
          onSubmit({
            fromAddress,
            toAddress: toAddress.value
          })
        }
        disabled={!isSubmitButtonActive}
      >
        {t('Continue')}
      </FooterButton>
    </ModalContent>
  )
}

export default TransferAddressesTxModalContent

function useStateWithError<T>(initialValue: T) {
  const [value, setValue] = useState({ value: initialValue, error: '' })

  const setValueWithError = (newValue: T, newError: string) => {
    setValue({ value: newValue, error: newError })
  }

  return [value, setValueWithError] as const
}
