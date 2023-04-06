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

import {
  ChainInfo,
  formatChain,
  isCompatibleChainGroup,
  parseChain,
  PROVIDER_NAMESPACE
} from '@alephium/walletconnect-provider'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import AddressSelect from '@/components/Inputs/AddressSelect'
import Input from '@/components/Inputs/Input'
import { Section } from '@/components/PageComponents/PageContainers'
import { useWalletConnectContext } from '@/contexts/walletconnect'
import { useAppSelector } from '@/hooks/redux'
import walletConnectFull from '@/images/wallet-connect-full.svg'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import { Address } from '@/types/addresses'
import { NetworkPreset } from '@/types/network'
import { NetworkSettings } from '@/types/settings'
import { AlephiumWindow } from '@/types/window'
import { extractErrorMsg } from '@/utils/misc'

type WalletConnectSessionState = 'uninitialized' | 'proposal' | 'error'

interface WalletConnectModalProps {
  onClose: () => void
}

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

const WalletConnectModal = ({ onClose }: WalletConnectModalProps) => {
  const { t } = useTranslation()
  const { walletConnectClient, deepLinkUri, onConnect } = useWalletConnectContext()
  const addresses = useAppSelector(selectAllAddresses)
  const currentNetwork = useAppSelector((s) => s.network)

  const [uri, setUri] = useState(deepLinkUri)
  const [error, setError] = useState('')
  const [wcSessionState, setWcSessionState] = useState<WalletConnectSessionState>('uninitialized')
  const [proposal, setProposal] = useState<SignClientTypes.EventArguments['session_proposal']>()
  const [requiredChainInfo, setRequiredChainInfo] = useState<ChainInfo>()

  const group = requiredChainInfo?.chainGroup
  const addressOptions = group === undefined ? addresses : addresses.filter((a) => a.group === group)
  const [signerAddress, setSignerAddress] = useState<Address | undefined>(addressOptions.find((a) => a.isDefault))

  useEffect(() => {
    if (!walletConnectClient) return

    const onProposal = async (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      const { requiredNamespaces } = proposal.params
      const requiredChains = requiredNamespaces[PROVIDER_NAMESPACE].chains
      const requiredChainInfo = parseChain(requiredChains[0])

      setRequiredChainInfo(requiredChainInfo)
      setProposal(proposal)
      setWcSessionState('proposal')
    }

    walletConnectClient.on('session_proposal', onProposal)

    return () => {
      walletConnectClient.removeListener('session_proposal', onProposal)
    }
  }, [walletConnectClient])

  const handleConnect = useCallback(
    async (uri: string) => {
      if (!walletConnectClient) return

      try {
        await walletConnectClient.pair({ uri })
        onConnect()
      } catch (e) {
        setError(`${t('Could not pair with WalletConnect')}: ${extractErrorMsg(e)}`)
      } finally {
        setUri('')
      }
    },
    [walletConnectClient, onConnect, t]
  )

  useEffect(() => {
    if (deepLinkUri) handleConnect(deepLinkUri)
  }, [deepLinkUri, handleConnect])

  const setErrorState = (error: string): void => {
    setWcSessionState('error')
    setError(error)
  }

  const chainAccounts = (address: Address, chain: ChainInfo): string[] => {
    if (!isCompatibleChainGroup(address.group, chain.chainGroup)) {
      setErrorState(
        t(
          'The group of the selected address ({{ addressGroup }}) does not match the group required by WalletConnect ({{ walletConnectGroup }})',
          {
            addressGroup: address.group,
            walletConnectGroup: chain.chainGroup
          }
        )
      )
    }

    return [`${formatChain(chain.networkId, chain.chainGroup)}:${address.publicKey}/default`]
  }

  const handleApprove = async () => {
    if (!walletConnectClient || !signerAddress) return

    if (proposal === undefined) return setWcSessionState('uninitialized')

    const { id, requiredNamespaces, relays } = proposal.params
    const requiredNamespace = requiredNamespaces[PROVIDER_NAMESPACE]

    if (requiredNamespace.chains.length !== 1)
      return setErrorState(
        t('Too many chains in the WalletConnect proposal, expected 1, got {{ num }}', {
          num: requiredNamespace.chains.length
        })
      )

    const requiredChain = parseChain(requiredNamespace.chains[0])

    if (!isNetworkValid(requiredChain.networkId, currentNetwork.settings.networkId))
      return setErrorState(
        t(
          'The current network ({{ currentNetwork }}) does not match the network requested by WalletConnect ({{ walletConnectNetwork }})',
          {
            currentNetwork: currentNetwork.name,
            walletConnectNetwork: requiredChain.networkId
          }
        )
      )

    const namespaces: SessionTypes.Namespaces = {
      alephium: {
        methods: requiredNamespace.methods,
        events: requiredNamespace.events,
        accounts: chainAccounts(signerAddress, requiredChain)
      }
    }

    if (!isCompatibleChainGroup(signerAddress.group, requiredChain.chainGroup))
      return setErrorState(
        t(
          'The group of the selected address ({{ addressGroup }}) does not match the group required by WalletConnect ({{ walletConnectGroup }})',
          {
            addressGroup: signerAddress.group,
            walletConnectGroup: requiredChain.chainGroup
          }
        )
      )

    const { acknowledged } = await walletConnectClient.approve({ id, relayProtocol: relays[0].protocol, namespaces })
    await acknowledged()
    onClose()
    electron?.app.hide()
  }

  const handleReject = async () => {
    if (!walletConnectClient) return
    if (proposal === undefined) return setWcSessionState('uninitialized')

    await walletConnectClient.reject({
      id: proposal.id,
      reason: {
        code: 123, // TODO: Fix this
        message: 'reject me' // TODO: Fix this
      }
    })
    onClose()
    electron?.app.hide()
  }

  const handleRetry = () => {
    setWcSessionState('uninitialized')
    setError('')
  }

  return !walletConnectClient ? null : error ? (
    <CenteredModal
      title={<ImageStyled src={walletConnectFull} />}
      subtitle={t('WalletConnect error')}
      onClose={onClose}
    >
      {error}
      <ModalFooterButtons>
        <ModalFooterButton onClick={handleRetry}>{t('Try again')}</ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  ) : wcSessionState === 'uninitialized' && !deepLinkUri && addresses.length > 0 ? (
    <CenteredModal title={<ImageStyled src={walletConnectFull} />} subtitle={t('Connect to a dApp')} onClose={onClose}>
      <Input onChange={(t) => setUri(t.target.value)} value={uri} label={t('Paste what was copied from the dApp')} />
      <ModalFooterButtons>
        <ModalFooterButton onClick={onClose}>{t('Cancel')}</ModalFooterButton>
        <ModalFooterButton onClick={() => handleConnect(uri)} disabled={uri === ''}>
          {t('Connect')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  ) : wcSessionState === 'proposal' && proposal && signerAddress ? (
    <CenteredModal
      title={<ImageStyled src={walletConnectFull} />}
      subtitle={t('Approve the proposal to connect')}
      onClose={onClose}
    >
      <Section>
        <InfoBox>
          <Info>{t('Please review the following before authorizing the dApp')}:</Info>
          <List>
            <Info>
              {t('Name')}: {proposal.params.proposer.metadata.name}
            </Info>
            <Info>URL: {proposal.params.proposer.metadata.url}</Info>
            <Info>
              {t('Description')}: {proposal.params.proposer.metadata.description}
            </Info>
            <Info>
              {t('Network ID')}: {requiredChainInfo?.networkId}
            </Info>
            <Info>
              {t('Address group')}: {requiredChainInfo?.chainGroup ?? t('all')}
            </Info>
          </List>
        </InfoBox>
      </Section>
      <Section>
        <AddressSelect
          label={t('Signer address')}
          title={t('Select an address to sign with.')}
          options={addressOptions}
          defaultAddress={signerAddress}
          onAddressChange={setSignerAddress}
          id="from-address"
          hideEmptyAvailableBalance
        />
      </Section>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={handleReject}>
          {t('Reject')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleApprove}>{t('Approve')}</ModalFooterButton>
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

const ImageStyled = styled.img`
  width: 12rem;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1em;
`

const Info = styled.div`
  margin-bottom: 1em;
`
