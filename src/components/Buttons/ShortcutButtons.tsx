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

import { ArrowDown, ArrowUp, Lock, Settings } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import AddressOptionsModal from '@/modals/AddressOptionsModal'
import ModalPortal from '@/modals/ModalPortal'
import ReceiveModal from '@/modals/ReceiveModal'
import SendModalTransfer from '@/modals/SendModals/SendModalTransfer'
import SettingsModal from '@/modals/SettingsModal'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { walletLocked } from '@/storage/wallets/walletActions'
import { AddressHash } from '@/types/addresses'

interface ShortcutButtonsProps {
  analyticsOrigin: string
  send?: boolean
  receive?: boolean
  lock?: boolean
  walletSettings?: boolean
  addressSettings?: boolean
  addressHash?: AddressHash
  highlight?: boolean
}

const ShortcutButtons = ({
  analyticsOrigin,
  send,
  receive,
  lock,
  walletSettings,
  addressSettings,
  addressHash,
  highlight
}: ShortcutButtonsProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const posthog = usePostHog()

  const address = useAppSelector((s) => selectAddressByHash(s, addressHash ?? ''))

  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)

  const lockWallet = () => {
    dispatch(walletLocked())

    posthog?.capture('Locked wallet', { origin: analyticsOrigin })
  }

  const handleReceiveClick = () => {
    setIsReceiveModalOpen(true)

    posthog?.capture('Receive button clicked', { origin: analyticsOrigin })
  }

  const handleSendClick = () => {
    setIsSendModalOpen(true)

    posthog?.capture('Send button clicked', { origin: analyticsOrigin })
  }

  const handleWalletSettingsClick = () => {
    setIsSettingsModalOpen(true)

    posthog?.capture('Wallet settings button clicked', { origin: analyticsOrigin })
  }

  const handleAddressSettingsClick = () => {
    setIsAddressOptionsModalOpen(true)

    posthog?.capture('Address settings button clicked', { origin: analyticsOrigin })
  }

  return (
    <>
      {receive && (
        <ShortcutButton
          transparent
          borderless
          onClick={handleReceiveClick}
          Icon={ArrowDown}
          iconColor={theme.global.valid}
          highlight={highlight}
        >
          <ButtonText>{t('Receive')}</ButtonText>
        </ShortcutButton>
      )}
      {send && (
        <ShortcutButton
          transparent
          borderless
          onClick={handleSendClick}
          Icon={ArrowUp}
          iconColor={theme.global.accent}
          highlight={highlight}
        >
          <ButtonText>{t('Send')}</ButtonText>
        </ShortcutButton>
      )}
      {walletSettings && (
        <ShortcutButton
          transparent
          borderless
          onClick={handleWalletSettingsClick}
          Icon={Settings}
          highlight={highlight}
        >
          <ButtonText>{t('Settings')}</ButtonText>
        </ShortcutButton>
      )}
      {lock && (
        <ShortcutButton transparent borderless onClick={lockWallet} Icon={Lock} highlight={highlight}>
          <ButtonText>{t('Lock wallet')}</ButtonText>
        </ShortcutButton>
      )}
      {addressSettings && addressHash && (
        <ShortcutButton transparent borderless onClick={handleAddressSettingsClick} Icon={Settings}>
          <ButtonText>{t('Settings')}</ButtonText>
        </ShortcutButton>
      )}
      <ModalPortal>
        {isSendModalOpen && (
          <SendModalTransfer initialTxData={{ fromAddress: address }} onClose={() => setIsSendModalOpen(false)} />
        )}
        {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
        {isReceiveModalOpen && <ReceiveModal addressHash={addressHash} onClose={() => setIsReceiveModalOpen(false)} />}
        {isAddressOptionsModalOpen && addressHash && (
          <AddressOptionsModal addressHash={addressHash} onClose={() => setIsAddressOptionsModalOpen(false)} />
        )}
      </ModalPortal>
    </>
  )
}

export default ShortcutButtons

const ShortcutButton = styled(Button)<Pick<ShortcutButtonsProps, 'highlight'>>`
  border-radius: 0;
  margin: 0;
  width: auto;
  height: 60px;
  background-color: ${({ theme, highlight }) => (highlight ? theme.bg.background2 : theme.bg.primary)};
  color: ${({ theme }) => theme.font.primary};
`

const ButtonText = styled.div`
  font-weight: var(--fontWeight-semiBold);
`
