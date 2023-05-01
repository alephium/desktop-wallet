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

import { formatChain, isCompatibleAddressGroup, parseChain, PROVIDER_NAMESPACE } from '@alephium/walletconnect-provider'
import { SessionTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { AlertCircle } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import AddressSelect from '@/components/Inputs/AddressSelect'
import Input from '@/components/Inputs/Input'
import { Section } from '@/components/PageComponents/PageContainers'
import { useWalletConnectContext } from '@/contexts/walletconnect'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import DAppMetadataBox from '@/modals/WalletConnectModal/DAppMetadataBoxProps'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import { walletConnectProposalApprovalFailed } from '@/storage/dApps/dAppActions'
import { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import { Address } from '@/types/addresses'
import { NetworkPreset } from '@/types/network'
import { NetworkSettings } from '@/types/settings'
import { AlephiumWindow } from '@/types/window'
import { getRandomLabelColor } from '@/utils/colors'

interface WalletConnectModalProps {
  onClose: () => void
}

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

const WalletConnectModal = ({ onClose }: WalletConnectModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const {
    walletConnectClient,
    connectToWalletConnect,
    wcSessionState,
    requiredChainInfo,
    proposalEvent,
    sessionTopic,
    onProposalApprove,
    onSessionDelete,
    connectedDAppMetadata
  } = useWalletConnectContext()
  const addresses = useAppSelector(selectAllAddresses)
  const currentNetwork = useAppSelector((s) => s.network)
  const { generateAddress } = useAddressGeneration()
  const posthog = usePostHog()

  const [uri, setUri] = useState('')
  const [signerAddressOptions, setSignerAddressOptions] = useState<Address[]>([])
  const [signerAddress, setSignerAddress] = useState<Address>()

  const group = requiredChainInfo?.addressGroup

  useEffect(() => {
    const addressOptions = group === undefined ? addresses : addresses.filter((a) => a.group === group)

    setSignerAddressOptions(addressOptions)
    setSignerAddress(
      addressOptions.length > 0 ? addressOptions.find((a) => a.isDefault) ?? addressOptions[0] : undefined
    )
  }, [addresses, group])

  const handleConnect = () => connectToWalletConnect(uri)

  const handleApprove = async () => {
    if (!walletConnectClient || !signerAddress) return
    if (proposalEvent === undefined) return onSessionDelete()

    const { id, requiredNamespaces, relays } = proposalEvent.params
    const requiredNamespace = requiredNamespaces[PROVIDER_NAMESPACE]

    if (requiredNamespace?.chains?.length !== 1)
      return dispatch(
        walletConnectProposalApprovalFailed(
          t('Too many chains in the WalletConnect proposal, expected 1, got {{ num }}', {
            num: requiredNamespace?.chains?.length
          })
        )
      )

    const requiredChain = parseChain(requiredNamespace.chains[0])

    if (!isNetworkValid(requiredChain.networkId, currentNetwork.settings.networkId))
      return dispatch(
        walletConnectProposalApprovalFailed(
          t(
            'The current network ({{ currentNetwork }}) does not match the network requested by WalletConnect ({{ walletConnectNetwork }})',
            {
              currentNetwork: currentNetwork.name,
              walletConnectNetwork: requiredChain.networkId
            }
          )
        )
      )

    if (!isCompatibleAddressGroup(signerAddress.group, requiredChain.addressGroup))
      return dispatch(
        walletConnectProposalApprovalFailed(
          t(
            'The group of the selected address ({{ addressGroup }}) does not match the group required by WalletConnect ({{ walletConnectGroup }})',
            {
              addressGroup: signerAddress.group,
              walletConnectGroup: requiredChain.addressGroup
            }
          )
        )
      )

    const namespaces: SessionTypes.Namespaces = {
      alephium: {
        methods: requiredNamespace.methods,
        events: requiredNamespace.events,
        accounts: [
          `${formatChain(requiredChain.networkId, requiredChain.addressGroup)}:${signerAddress.publicKey}/default`
        ]
      }
    }

    const { topic, acknowledged } = await walletConnectClient.approve({
      id,
      relayProtocol: relays[0].protocol,
      namespaces
    })
    onProposalApprove(topic)
    await acknowledged()
    onClose()
    electron?.app.hide()
  }

  const handleReject = async () => {
    console.log('handleReject walletConnectClient:', walletConnectClient)
    if (!walletConnectClient) return
    console.log('handleReject proposalEvent:', proposalEvent)
    if (proposalEvent === undefined) return onSessionDelete()

    await walletConnectClient.reject({ id: proposalEvent.id, reason: getSdkError('USER_REJECTED') })
    onSessionDelete()
    onClose()
    electron?.app.hide()
  }

  const handleDisconnect = async () => {
    console.log('handleDisconnect walletConnectClient:', walletConnectClient)
    console.log('handleDisconnect sessionTopic:', sessionTopic)
    if (!walletConnectClient || !sessionTopic) return

    await walletConnectClient.disconnect({ topic: sessionTopic, reason: getSdkError('USER_DISCONNECTED') })
    onClose()
    onSessionDelete()
  }

  const rejectConnectionAndCloseModal = async () => {
    console.log('rejectConnectionAndCloseModal walletConnectClient:', walletConnectClient)
    console.log('rejectConnectionAndCloseModal proposalEvent:', proposalEvent)
    if (walletConnectClient && proposalEvent) {
      onSessionDelete()
      await walletConnectClient.reject({ id: proposalEvent.id, reason: getSdkError('USER_REJECTED') })
    }

    onClose()
  }

  const generateAddressInGroup = () => {
    const address = generateAddress()
    saveNewAddresses([{ ...address, isDefault: false, color: getRandomLabelColor() }])

    posthog?.capture('New address created through WalletConnect modal')
  }

  const showManualInitialization = wcSessionState === 'uninitialized' && addresses.length > 0
  const showProposalForApproval = wcSessionState === 'proposal' && proposalEvent
  const showConnectedDApp = wcSessionState === 'initialized' && sessionTopic
  const validSignerAddressOption = signerAddress || signerAddressOptions.length > 0

  return !walletConnectClient ? null : showManualInitialization ? (
    <CenteredModal title="WalletConnect" subtitle={t('Connect to a dApp')} onClose={onClose}>
      <Section>
        <Input
          onChange={(t) => setUri(t.target.value)}
          value={uri}
          label={t('Paste WalletConnect URI copied from the dApp')}
          heightSize="big"
        />
      </Section>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleConnect} disabled={uri === ''}>
          {t('Connect')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  ) : showProposalForApproval ? (
    <CenteredModal
      title="WalletConnect"
      subtitle={t('Approve the proposal to connect')}
      onClose={rejectConnectionAndCloseModal}
    >
      <Section inList>
        <DAppMetadataBox metadata={proposalEvent.params.proposer.metadata} />
      </Section>
      <Section>
        {validSignerAddressOption ? (
          <AddressSelect
            label={t('Signer address')}
            title={t('Select an address to sign with.')}
            options={signerAddressOptions}
            defaultAddress={signerAddress}
            onAddressChange={setSignerAddress}
            id="from-address"
            emptyListPlaceholder={t('There are no addresses in the required group: {{ group }}', { group })}
          />
        ) : (
          <InfoBox importance="warning" Icon={AlertCircle}>
            <GenerateNewAddressContent>
              <div>
                <div>{t('There are no addresses in the required group: {{ group }}', { group })}</div>
                <div>{t('Please, generate a new address in group {{ group }} first.', { group })}</div>
              </div>
              <Button short onClick={generateAddressInGroup}>
                {t('Generate')}
              </Button>
            </GenerateNewAddressContent>
          </InfoBox>
        )}
      </Section>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={handleReject}>
          {t('Reject')}
        </ModalFooterButton>
        <ModalFooterButton variant="valid" onClick={handleApprove} disabled={!validSignerAddressOption}>
          {t('Approve')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  ) : showConnectedDApp ? (
    <CenteredModal title="WalletConnect" subtitle={t('Current dApp connection details')} onClose={onClose}>
      <Section inList>
        <DAppMetadataBox metadata={connectedDAppMetadata} />
      </Section>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton role="secondary" variant="alert" onClick={handleDisconnect}>
          {t('Disconnect')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  ) : null
}

export default WalletConnectModal

const isNetworkValid = (networkId: string, currentNetworkId: NetworkSettings['networkId']) =>
  (networkId === 'devnet' && currentNetworkId === networkPresets.localhost.networkId) ||
  (Object.keys(networkPresets) as Array<NetworkPreset>).some(
    (network) => network === networkId && currentNetworkId === networkPresets[network].networkId
  )

const GenerateNewAddressContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
`
