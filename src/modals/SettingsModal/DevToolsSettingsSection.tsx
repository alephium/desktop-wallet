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

import { getHumanReadableError } from '@alephium/sdk'
import { AlertTriangle, FileCode, TerminalSquare } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressRow from '@/components/AddressRow'
import Box from '@/components/Box'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import InlineLabelValueInput from '@/components/Inputs/InlineLabelValueInput'
import Toggle from '@/components/Inputs/Toggle'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import Table from '@/components/Table'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import SendModalCallContact from '@/modals/SendModals/CallContract'
import SendModalDeployContract from '@/modals/SendModals/DeployContract'
import { selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { copiedToClipboard, copyToClipboardFailed } from '@/storage/global/globalActions'
import { devToolsToggled } from '@/storage/settings/settingsActions'
import { Address } from '@/types/addresses'

const DevToolsSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const devTools = useAppSelector((state) => state.settings.devTools)
  const posthog = usePostHog()

  const [isDeployContractSendModalOpen, setIsDeployContractSendModalOpen] = useState(false)
  const [isCallScriptSendModalOpen, setIsCallScriptSendModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address>()

  const toggleDevTools = () => {
    dispatch(devToolsToggled())

    posthog?.capture('Enabled dev tools')
  }

  const confirmAddressPrivateKeyCopyWithPassword = (address: Address) => {
    setIsPasswordModalOpen(true)
    setSelectedAddress(address)
  }

  const onCorrectPasswordEntered = async () => {
    if (!selectedAddress) return

    try {
      await navigator.clipboard.writeText(selectedAddress.privateKey)
      dispatch(copiedToClipboard(t('Private key copied!')))

      posthog?.capture('Copied address private key')
    } catch (e) {
      dispatch(copyToClipboardFailed(getHumanReadableError(e, t('Could not copy private key.'))))
    } finally {
      closePasswordModal()
    }
  }

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setSelectedAddress(undefined)
  }

  return (
    <>
      <Section align="flex-start">
        <Box>
          <InlineLabelValueInput
            label={t('Enable developer tools')}
            description={t('Features for developers only')}
            InputComponent={<Toggle label={t('Enable developer tools')} toggled={devTools} onToggle={toggleDevTools} />}
          />
        </Box>
      </Section>
      {devTools && (
        <>
          <Section align="flex-start" inList>
            <h2 tabIndex={0} role="label">
              {t('Smart contracts')}
            </h2>
            <ButtonsRow>
              <Button Icon={FileCode} onClick={() => setIsDeployContractSendModalOpen(true)} role="secondary">
                {t('Deploy contract')}
              </Button>
              <Button Icon={TerminalSquare} onClick={() => setIsCallScriptSendModalOpen(true)} role="secondary">
                {t('Call contract')}
              </Button>
            </ButtonsRow>
          </Section>
          <PrivateKeySection align="flex-start" role="list">
            <h2 tabIndex={0} role="label">
              {t('Private key export')}
            </h2>
            <Paragraph>{t('Click on an address to copy its private key.')}</Paragraph>
            <Table>
              {addresses.map((address) => (
                <AddressRow
                  address={address}
                  onClick={confirmAddressPrivateKeyCopyWithPassword}
                  disableAddressCopy
                  key={address.hash}
                />
              ))}
            </Table>
          </PrivateKeySection>
        </>
      )}
      <ModalPortal>
        {isDeployContractSendModalOpen && defaultAddress && (
          <SendModalDeployContract
            initialTxData={{ fromAddress: defaultAddress }}
            onClose={() => setIsDeployContractSendModalOpen(false)}
          />
        )}
        {isCallScriptSendModalOpen && defaultAddress && (
          <SendModalCallContact
            initialTxData={{ fromAddress: defaultAddress }}
            onClose={() => setIsCallScriptSendModalOpen(false)}
          />
        )}
        {isPasswordModalOpen && (
          <CenteredModal title={t('Enter password')} onClose={closePasswordModal}>
            <PasswordConfirmation
              text={t('Enter your password to copy the private key.')}
              buttonText={t('Copy private key')}
              onCorrectPasswordEntered={onCorrectPasswordEntered}
            >
              <InfoBox importance="alert" Icon={AlertTriangle}>
                {`${t('This is a feature for developers only.')} ${t(
                  'You will not be able to recover your account with the private key!'
                )} ${t('Please, backup your secret phrase instead.')} ${t('Never disclose this key.')} ${t(
                  'Anyone with your private keys can steal any assets held in your addresses.'
                )}`}
              </InfoBox>
            </PasswordConfirmation>
          </CenteredModal>
        )}
      </ModalPortal>
    </>
  )
}

export default DevToolsSettingsSection

const ButtonsRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: var(--spacing-4);
`

const PrivateKeySection = styled(Section)`
  margin-top: var(--spacing-6);
`
