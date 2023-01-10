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

import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import CenteredModal from '../modals/CenteredModal'
import InfoBox from './InfoBox'
import Select from './Inputs/Select'
import WalletPassphrase from './Inputs/WalletPassphrase'
import PasswordConfirmation from './PasswordConfirmation'

interface WalletNameSelectOptions {
  label: string
  value: string
}

const WalletSwitcher = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { walletNames, activeWalletName, unlockWallet } = useGlobalContext()

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passphrase, setPassphrase] = useState('')
  const [isPassphraseConfirmed, setIsPassphraseConfirmed] = useState(false)
  const [switchToWalletName, setSwitchToWalletName] = useState(activeWalletName)

  const walletNameSelectOptions = walletNames.map((walletName) => ({
    label: walletName,
    value: walletName
  }))

  const handleWalletNameChange = (option: WalletNameSelectOptions | undefined) => {
    if (option) {
      setSwitchToWalletName(option.value)
      setIsPasswordModalOpen(true)
    }
  }

  const onPasswordModalClose = () => {
    setSwitchToWalletName('')
    setIsPasswordModalOpen(false)
  }

  const onLoginClick = (password: string) => {
    setIsPasswordModalOpen(false)
    unlockWallet(
      switchToWalletName,
      password,
      () => {
        const nextPageLocation = '/wallet/overview'
        if (location.pathname !== nextPageLocation) navigate(nextPageLocation)
      },
      passphrase
    )
    if (passphrase) setPassphrase('')
  }

  return (
    <>
      {walletNameSelectOptions.length === 0 ? (
        <InfoBox text={activeWalletName} label={t`Wallet`} />
      ) : (
        <Select
          label={t`Current wallet`}
          options={walletNameSelectOptions}
          controlledValue={{
            label: activeWalletName,
            value: activeWalletName
          }}
          onValueChange={handleWalletNameChange}
          title={t`Select a wallet`}
          id="wallet"
          raised
          skipEqualityCheck
        />
      )}
      <AnimatePresence mode="wait" initial={true}>
        {isPasswordModalOpen && (
          <CenteredModal narrow title={t`Enter password`} onClose={onPasswordModalClose}>
            <PasswordConfirmation
              text={t('Enter password for "{{ switchToWalletName }}"', { switchToWalletName })}
              buttonText={t`Login`}
              onCorrectPasswordEntered={onLoginClick}
              walletName={switchToWalletName}
              isSubmitDisabled={!isPassphraseConfirmed}
            >
              <WalletPassphraseStyled
                onPassphraseConfirmed={setPassphrase}
                setIsPassphraseConfirmed={setIsPassphraseConfirmed}
              />
            </PasswordConfirmation>
          </CenteredModal>
        )}
      </AnimatePresence>
    </>
  )
}

export default WalletSwitcher

const WalletPassphraseStyled = styled(WalletPassphrase)`
  margin: 16px 0;
  width: 100%;
`