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

import { CopyIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import AddressSelect from '@/components/Inputs/AddressSelect'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import { selectAddressByHash, selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { copiedToClipboard, copyToClipboardFailed } from '@/storage/global/globalActions'

interface ReceiveModalProps {
  onClose: () => void
  addressHash?: string
}

const QRCodeSize = 250

const ReceiveModal = ({ onClose, addressHash }: ReceiveModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash ?? ''))

  const [selectedAddress, setSelectedAddress] = useState(defaultAddress)

  const handleCopyAddressToClipboard = useCallback(() => {
    if (!selectedAddress?.hash) {
      dispatch(copyToClipboardFailed())
    } else {
      navigator.clipboard
        .writeText(selectedAddress?.hash)
        .catch((e) => {
          throw e
        })
        .then(() => {
          dispatch(copiedToClipboard())
        })
    }
  }, [dispatch, selectedAddress?.hash])

  return (
    <CenteredModal title={t('Receive')} onClose={onClose}>
      <Content>
        <AddressSelect
          label={t('Address')}
          title={t('Select the address to receive funds to.')}
          options={addresses}
          defaultAddress={address ?? defaultAddress}
          onAddressChange={setSelectedAddress}
          disabled={!!addressHash}
          id="address"
        />
        <QRCodeSection>
          {selectedAddress?.hash && (
            <QRCodeContainer>
              <QRCode
                size={QRCodeSize}
                value={selectedAddress.hash}
                bgColor={theme.bg.primary}
                fgColor={theme.font.primary}
              />
            </QRCodeContainer>
          )}
        </QRCodeSection>
        <Button role="secondary" Icon={CopyIcon} onClick={handleCopyAddressToClipboard}>
          {t('Copy address')}
        </Button>
      </Content>
    </CenteredModal>
  )
}

export default ReceiveModal

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: var(--spacing-3);
  gap: 15px;
`

const QRCodeSection = styled.div`
  display: flex;
  justify-content: center;
`

const QRCodeContainer = styled(Box)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${QRCodeSize + 25}px;
  height: ${QRCodeSize + 25}px;
`
