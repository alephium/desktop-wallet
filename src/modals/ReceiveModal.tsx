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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import AddressSelect from '@/components/Inputs/AddressSelect'
import { useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import { selectAddressByHash, selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSlice'

interface ReceiveModalProps {
  onClose: () => void
  addressHash?: string
}

const ReceiveModal = ({ onClose, addressHash }: ReceiveModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const addresses = useAppSelector(selectAllAddresses)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash ?? ''))

  const [selectedAddress, setSelectedAddress] = useState(defaultAddress)

  return (
    <CenteredModal title={t('Receive')} onClose={onClose}>
      <Content>
        <AddressSelect
          label={t('Address')}
          title={t('Select the address to receive funds to.')}
          options={addresses}
          defaultAddress={address ?? defaultAddress}
          onAddressChange={setSelectedAddress}
          id="address"
        />
        <QRCodeSection>
          {selectedAddress?.hash && (
            <QRCode size={300} value={selectedAddress.hash} bgColor={theme.bg.primary} fgColor={theme.font.primary} />
          )}
        </QRCodeSection>
      </Content>
    </CenteredModal>
  )
}

export default ReceiveModal

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-3);
`

const QRCodeSection = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
`
