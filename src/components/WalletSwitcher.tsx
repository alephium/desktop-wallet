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
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import Select from '@/components/Inputs/Select'
import WalletPassphrase from '@/components/Inputs/WalletPassphrase'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useGlobalContext } from '@/contexts/global'
import { useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import { StoredWallet } from '@/types/wallet'

interface WalletSwitcherProps {
  onUnlock: () => void
}

const WalletSwitcher = ({ onUnlock }: WalletSwitcherProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeWallet, wallets] = useAppSelector((s) => [s.activeWallet, s.global.wallets])
  const { unlockWallet } = useGlobalContext()

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseConfirmed, setIsPassphraseConfirmed] = useState(false)
  const [selectedWalletId, setSelectedWalletId] = useState(activeWallet.id)

  const walletSelectOptions = wallets.map((wallet) => ({ value: wallet.id, label: wallet.name }))
  const selectedWalletOption = walletSelectOptions.find((wallet) => wallet.value === selectedWalletId)

  const handleWalletSelect = (walletId: StoredWallet['id']) => {
    setSelectedWalletId(walletId)
    setIsPasswordModalOpen(true)
  }

  const onUnlockClick = (password: string) => {
    if (!selectedWalletOption) return

    onUnlock()
    setIsPasswordModalOpen(false)
    unlockWallet({
      event: 'switch',
      walletId: selectedWalletOption.value,
      password,
      passphrase,
      afterUnlock: () => {
        const nextPageLocation = '/wallet/overview'
        if (location.pathname !== nextPageLocation) navigate(nextPageLocation)
      }
    })
    if (passphrase) setPassphrase('')
  }

  return (
    <>
      {walletSelectOptions.length === 0 ? (
        <InfoBox text={activeWallet.name} label={t`Wallet`} />
      ) : (
        <Select
          label={t`Current wallet`}
          controlledValue={selectedWalletOption}
          options={walletSelectOptions}
          onSelect={handleWalletSelect}
          title={t`Select a wallet`}
          id="wallet"
          raised
          skipEqualityCheck
        />
      )}
      <ModalPortal>
        {isPasswordModalOpen && (
          <CenteredModal narrow title={t('Enter password')} onClose={() => setIsPasswordModalOpen(false)}>
            <PasswordConfirmation
              text={t('Enter password for "{{ switchToWalletName }}"', {
                switchToWalletName: selectedWalletOption?.label
              })}
              buttonText={t('Unlock')}
              onCorrectPasswordEntered={onUnlockClick}
              walletId={selectedWalletOption?.value}
              isSubmitDisabled={!isPassphraseConfirmed}
            >
              <WalletPassphraseStyled
                onPassphraseConfirmed={setPassphrase}
                setIsPassphraseConfirmed={setIsPassphraseConfirmed}
              />
            </PasswordConfirmation>
          </CenteredModal>
        )}
      </ModalPortal>
    </>
  )
}

export default WalletSwitcher

const WalletPassphraseStyled = styled(WalletPassphrase)`
  margin: 16px 0;
  width: 100%;
`
