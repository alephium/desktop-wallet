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

import { Pencil, Trash } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import CheckMark from '@/components/CheckMark'
import InfoBox from '@/components/InfoBox'
import { BoxContainer, Section } from '@/components/PageComponents/PageContainers'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import SecretPhraseModal from '@/modals/SecretPhraseModal'
import EditWalletNameModal from '@/modals/SettingsModal/EditWalletNameModal'
import WalletQRCodeExportModal from '@/modals/WalletQRCodeExportModal'
import WalletRemovalModal from '@/modals/WalletRemovalModal'
import AddressMetadataStorage from '@/storage/addresses/addressMetadataPersistentStorage'
import { activeWalletDeleted, walletLocked } from '@/storage/wallets/walletActions'
import { walletDeleted } from '@/storage/wallets/walletActions'
import WalletStorage from '@/storage/wallets/walletPersistentStorage'
import { ActiveWallet, StoredWallet } from '@/types/wallet'

const WalletsSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const activeWallet = useAppSelector((s) => s.activeWallet)
  const wallets = useAppSelector((s) => s.global.wallets)
  const posthog = usePostHog()

  const [walletToRemove, setWalletToRemove] = useState<StoredWallet | ActiveWallet>()
  const [isDisplayingSecretModal, setIsDisplayingSecretModal] = useState(false)
  const [isQRCodeModalVisible, setIsQRCodeModalVisible] = useState(false)
  const [isEditWalletNameModalOpen, setIsEditWalletNameModalOpen] = useState(false)

  const isAuthenticated = !!activeWallet.mnemonic && !!activeWallet.id

  const handleRemoveWallet = (walletId: string) => {
    WalletStorage.delete(walletId)
    AddressMetadataStorage.delete(walletId)
    dispatch(walletId === activeWallet.id ? activeWalletDeleted() : walletDeleted(walletId))
    setWalletToRemove(undefined)

    posthog?.capture('Deleted wallet')
  }

  const lockWallet = () => {
    dispatch(walletLocked())

    posthog?.capture('Locked wallet', { origin: 'settings' })
  }

  return (
    <>
      <Section align="flex-start" role="table">
        <h2 tabIndex={0} role="label">
          {t('Wallet list')} ({wallets.length})
        </h2>
        <BoxContainer role="rowgroup">
          {wallets.map((wallet) => (
            <WalletItem
              key={wallet.id}
              wallet={wallet}
              isCurrent={wallet.id === activeWallet.id}
              onWalletDelete={setWalletToRemove}
            />
          ))}
        </BoxContainer>
      </Section>
      {isAuthenticated && (
        <CurrentWalletSection align="flex-start">
          <h2>{t('Current wallet')}</h2>
          <InfoBox label={t('Wallet name')} short>
            <CurrentWalletBox>
              <WalletName>{activeWallet.name}</WalletName>
              <Button
                aria-label={t('Delete')}
                tabIndex={0}
                squared
                role="secondary"
                transparent
                borderless
                onClick={() => setIsEditWalletNameModalOpen(true)}
              >
                <Pencil size={15} />
              </Button>
            </CurrentWalletBox>
          </InfoBox>
          <ActionButtons>
            <Button role="secondary" onClick={lockWallet}>
              {t('Lock current wallet')}
            </Button>
            <Button role="secondary" onClick={() => setIsQRCodeModalVisible(true)}>
              {t('Export current wallet')}
            </Button>
            <Button transparent variant="alert" onClick={() => setIsDisplayingSecretModal(true)}>
              {t('Show your secret recovery phrase')}
            </Button>
            <Button variant="alert" onClick={() => setWalletToRemove(activeWallet as ActiveWallet)}>
              {t('Remove current wallet')}
            </Button>
          </ActionButtons>
        </CurrentWalletSection>
      )}
      <ModalPortal>
        {isDisplayingSecretModal && <SecretPhraseModal onClose={() => setIsDisplayingSecretModal(false)} />}
        {isQRCodeModalVisible && <WalletQRCodeExportModal onClose={() => setIsQRCodeModalVisible(false)} />}
        {isEditWalletNameModalOpen && <EditWalletNameModal onClose={() => setIsEditWalletNameModalOpen(false)} />}
        {walletToRemove && (
          <WalletRemovalModal
            walletName={walletToRemove.name}
            onClose={() => setWalletToRemove(undefined)}
            onConfirm={() => handleRemoveWallet(walletToRemove.id)}
          />
        )}
      </ModalPortal>
    </>
  )
}

interface WalletItemProps {
  wallet: StoredWallet
  isCurrent: boolean
  onWalletDelete: (wallet: StoredWallet) => void
}

const WalletItem = ({ wallet, isCurrent, onWalletDelete }: WalletItemProps) => {
  const { t } = useTranslation()
  const [isShowingDeleteButton, setIsShowingDeleteButton] = useState(false)

  return (
    <WalletItemContainer
      role="row"
      onMouseEnter={() => setIsShowingDeleteButton(true)}
      onMouseLeave={() => setIsShowingDeleteButton(false)}
    >
      <WalletName role="cell" tabIndex={0} onFocus={() => setIsShowingDeleteButton(true)}>
        {wallet.name}
        {isCurrent && <CheckMark />}
      </WalletName>

      <ButtonStyled
        aria-label={t('Delete')}
        tabIndex={0}
        squared
        role="secondary"
        transparent
        borderless
        onClick={() => onWalletDelete(wallet)}
        onBlur={() => setIsShowingDeleteButton(false)}
        disabled={!isShowingDeleteButton}
        isVisible={isShowingDeleteButton}
        Icon={Trash}
      />
    </WalletItemContainer>
  )
}

export default WalletsSettingsSection

const WalletItemContainer = styled.div`
  display: flex;
  align-items: center;
  height: var(--inputHeight);
  padding: 0 var(--spacing-3);
  gap: 10px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const WalletName = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
`

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`

const CurrentWalletSection = styled(Section)`
  margin-top: var(--spacing-4);
`

const CurrentWalletBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ButtonStyled = styled(Button)<{ isVisible: boolean }>`
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)} !important;
`
