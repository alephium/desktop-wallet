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

import { ArrowDown, ArrowUp, Settings } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AddressEllipsed from '@/components/AddressEllipsed'
import Box from '@/components/Box'
import Button from '@/components/Button'
import DotIcon from '@/components/DotIcon'
import TransactionList from '@/components/TransactionList'
import { useAppSelector } from '@/hooks/redux'
import AddressOptionsModal from '@/modals/AddressOptionsModal'
import ModalPortal from '@/modals/ModalPortal'
import ReceiveModal from '@/modals/ReceiveModal'
import SendModalTransfer from '@/modals/SendModals/SendModalTransfer'
import SideModal from '@/modals/SideModal'
import AmountsOverviewPanel from '@/pages/UnlockedWallet/OverviewPage/AmountsOverviewPanel'
import AssetsList from '@/pages/UnlockedWallet/OverviewPage/AssetsList'
import { selectAddressByHash } from '@/storage/app-state/slices/addressesSlice'
import { AddressHash } from '@/types/addresses'

interface AddressDetailsModalProps {
  addressHash: AddressHash
  onClose: () => void
}

const AddressDetailsModal = ({ addressHash, onClose }: AddressDetailsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [address, { isPassphraseUsed }] = useAppSelector((s) => [selectAddressByHash(s, addressHash), s.activeWallet])

  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)

  if (!address) return null

  return (
    <SideModal
      onClose={onClose}
      label={t('Address details')}
      width={800}
      header={
        <Header>
          <AddressColor>
            {address.isDefault && !isPassphraseUsed ? (
              <Star color={address.color}>★</Star>
            ) : (
              <DotIcon size={11} color={address.color} />
            )}
          </AddressColor>
          <Column>
            <Label>{address.label || <AddressEllipsedStyled addressHash={address.hash} />}</Label>
            <Subtitle>
              {address.label && <Hash addressHash={address.hash} />}
              <Group>
                {t('Group')} {address.group}
              </Group>
            </Subtitle>
          </Column>
        </Header>
      }
    >
      <Content>
        <AmountsOverviewPanel addressHash={addressHash} />
        <Shortcuts>
          <ButtonsGrid>
            <ShortcutButton
              transparent
              borderless
              onClick={() => setIsReceiveModalOpen(true)}
              Icon={ArrowDown}
              iconColor={theme.global.valid}
            >
              <ButtonText>{t('Receive')}</ButtonText>
            </ShortcutButton>
            <ShortcutButton
              transparent
              borderless
              onClick={() => setIsSendModalOpen(true)}
              Icon={ArrowUp}
              iconColor={theme.global.accent}
            >
              <ButtonText>{t('Send')}</ButtonText>
            </ShortcutButton>
            <ShortcutButton transparent borderless onClick={() => setIsAddressOptionsModalOpen(true)} Icon={Settings}>
              <ButtonText>{t('Settings')}</ButtonText>
            </ShortcutButton>
          </ButtonsGrid>
        </Shortcuts>
        <AssetsList
          addressHashes={[address.hash]}
          tokensTabTitle={t('Address tokens')}
          nftsTabTitle={t('Address NFTs')}
        />
        <TransactionList title={t('Address transactions')} addressHash={address.hash} compact />
      </Content>
      <ModalPortal>
        {isSendModalOpen && (
          <SendModalTransfer initialTxData={{ fromAddress: address }} onClose={() => setIsSendModalOpen(false)} />
        )}
        {isReceiveModalOpen && <ReceiveModal addressHash={address.hash} onClose={() => setIsReceiveModalOpen(false)} />}
        {isAddressOptionsModalOpen && address && (
          <AddressOptionsModal address={address} onClose={() => setIsAddressOptionsModalOpen(false)} />
        )}
      </ModalPortal>
    </SideModal>
  )
}

export default AddressDetailsModal

const Header = styled.div`
  display: flex;
  align-items: center;
`

const Label = styled.div`
  font-size: 23px;
  font-weight: var(--fontWeight-semiBold);
`

const AddressEllipsedStyled = styled(AddressEllipsed)`
  max-width: 300px;
`

const Hash = styled(AddressEllipsed)`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 16px;
  max-width: 250px;
`

const AddressColor = styled.div`
  width: 18px;
  display: flex;
  justify-content: center;
  margin-right: 15px;
`

const Star = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 18px;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const Group = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
`

const Subtitle = styled.div`
  display: flex;
  gap: 20px;
`

const Content = styled.div`
  padding: 22px 28px;
`

const Shortcuts = styled(Box)`
  overflow: hidden;
  background-color: ${({ theme }) => theme.border.primary};
  margin-bottom: 30px;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
`

const ShortcutButton = styled(Button)`
  border-radius: 0;
  margin: 0;
  width: auto;
  background-color: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.font.primary};
`

const ButtonText = styled.div`
  font-weight: var(--fontWeight-semiBold);
`
