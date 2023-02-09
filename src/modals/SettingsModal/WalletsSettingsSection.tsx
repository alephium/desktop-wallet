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

import { Trash } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { BoxContainer, Section } from '@/components/PageComponents/PageContainers'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import SecretPhraseModal from '@/modals/SecretPhraseModal'
import WalletQRCodeExportModal from '@/modals/WalletQRCodeExportModal'
import WalletRemovalModal from '@/modals/WalletRemovalModal'
import { activeWalletDeleted, walletLocked } from '@/storage/app-state/slices/activeWalletSlice'
import { walletDeleted } from '@/storage/app-state/slices/appSlice'
import AddressMetadataStorage from '@/storage/persistent-storage/addressMetadataPersistentStorage'
import WalletStorage from '@/storage/persistent-storage/walletPersistentStorage'

const WalletsSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const [{ mnemonic, name: activeWalletName }, walletNames] = useAppSelector((s) => [
    s.activeWallet,
    s.app.storedWalletNames
  ])

  const [isDisplayingSecretModal, setIsDisplayingSecretModal] = useState(false)
  const [walletToRemove, setWalletToRemove] = useState('')
  const [isQRCodeModalVisible, setIsQRCodeModalVisible] = useState(false)

  const openRemoveWalletModal = (walletName: string) => setWalletToRemove(walletName)

  const isAuthenticated = !!mnemonic && !!activeWalletName

  const handleRemoveWallet = (walletName: string) => {
    WalletStorage.delete(walletName)
    AddressMetadataStorage.delete(walletName)
    dispatch(walletName === activeWalletName ? activeWalletDeleted() : walletDeleted(walletName))

    setWalletToRemove('')
  }

  const lockWallet = () => dispatch(walletLocked())

  return (
    <>
      <Section align="flex-start" role="table">
        <h2 tabIndex={0} role="label">
          {t('Wallet list')} ({walletNames.length})
        </h2>
        <BoxContainer role="rowgroup">
          {walletNames.map((n) => (
            <WalletItem key={n} walletName={n} isCurrent={n === activeWalletName} onWalletDelete={setWalletToRemove} />
          ))}
        </BoxContainer>
      </Section>
      {isAuthenticated && (
        <CurrentWalletSection align="flex-start">
          <h2>{t('Current wallet')}</h2>
          <InfoBox label={t('Wallet name')} text={activeWalletName} />
          <ActionButtons>
            <Button role="secondary" onClick={lockWallet}>
              {t('Lock current wallet')}
            </Button>
            <Button transparent variant="alert" onClick={() => setIsQRCodeModalVisible(true)}>
              {t('Export current wallet')}
            </Button>
            <Button transparent variant="alert" onClick={() => setIsDisplayingSecretModal(true)}>
              {t('Show your secret recovery phrase')}
            </Button>
            <Button variant="alert" onClick={() => openRemoveWalletModal(activeWalletName)}>
              {t('Remove current wallet')}
            </Button>
          </ActionButtons>
        </CurrentWalletSection>
      )}
      <ModalPortal>
        {isDisplayingSecretModal && <SecretPhraseModal onClose={() => setIsDisplayingSecretModal(false)} />}
        {isQRCodeModalVisible && <WalletQRCodeExportModal onClose={() => setIsQRCodeModalVisible(false)} />}
        {walletToRemove && (
          <WalletRemovalModal
            walletName={walletToRemove}
            onClose={() => setWalletToRemove('')}
            onWalletRemove={() => handleRemoveWallet(walletToRemove)}
          />
        )}
      </ModalPortal>
    </>
  )
}

interface WalletItemProps {
  walletName: string
  isCurrent: boolean
  onWalletDelete: (walletName: string) => void
}

const WalletItem = ({ walletName, isCurrent, onWalletDelete }: WalletItemProps) => {
  const { t } = useTranslation()
  const [isShowingDeleteButton, setIsShowingDeleteButton] = useState(false)

  return (
    <WalletItemContainer
      role="row"
      onMouseEnter={() => setIsShowingDeleteButton(true)}
      onMouseLeave={() => setIsShowingDeleteButton(false)}
    >
      <WalletName role="cell" tabIndex={0} onFocus={() => setIsShowingDeleteButton(true)}>
        {walletName}
        {isCurrent && <CurrentWalletLabel> {t('(current)')}</CurrentWalletLabel>}
      </WalletName>
      {isShowingDeleteButton && (
        <Button
          aria-label={t('Delete')}
          tabIndex={0}
          squared
          role="secondary"
          transparent
          borderless
          onClick={() => onWalletDelete(walletName)}
          onBlur={() => setIsShowingDeleteButton(false)}
        >
          <Trash size={15} />
        </Button>
      )}
    </WalletItemContainer>
  )
}

export default WalletsSettingsSection

const WalletItemContainer = styled.div`
  display: flex;
  align-items: center;
  height: var(--inputHeight);
  padding: 0 var(--spacing-2);

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const WalletName = styled.div`
  flex: 1;
`

const CurrentWalletLabel = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const CurrentWalletSection = styled(Section)`
  margin-top: var(--spacing-8);
`
