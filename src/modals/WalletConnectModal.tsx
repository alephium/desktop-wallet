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

import InfoBox from '../components/InfoBox'
import AddressSelect from '../components/Inputs/AddressSelect'
import Input from '../components/Inputs/Input'
import { Section } from '../components/PageComponents/PageContainers'
import { Address, useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import { useWalletConnectContext } from '../contexts/walletconnect'
import walletConnectFull from '../images/wallet-connect-full.svg'
import { extractErrorMsg } from '../utils/misc'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'

type WalletConnectSessionState = 'uninitialized' | 'proposal' | 'require-unlock' | 'error'

interface Props {
  onClose: () => void
  onConnect?: () => void
}

const WalletConnectModal = ({ onClose, onConnect }: Props) => {
  const { t } = useTranslation()
  const { client } = useGlobalContext()
  const { walletConnectClient } = useWalletConnectContext()
  const { addresses } = useAddressesContext()
  const [uri, setUri] = useState('')
  const [error, setError] = useState('')
  const [wcSessionState, setWcSessionState] = useState<WalletConnectSessionState>(
    addresses.length > 0 ? 'uninitialized' : 'require-unlock'
  )
  const [proposal, setProposal] = useState<SignClientTypes.EventArguments['session_proposal']>()
  const [requiredChainInfo, setRequiredChainInfo] = useState<ChainInfo>()

  const group = requiredChainInfo?.chainGroup
  const addressOptions = group === undefined ? addresses : addresses.filter((a) => a.group === group)
  const [signerAddress, setSignerAddress] = useState<Address | undefined>(addressOptions.find((a) => a.settings.isMain))

  const onProposal = useCallback(
    async (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      const { requiredNamespaces } = proposal.params
      const requiredChains = requiredNamespaces[PROVIDER_NAMESPACE].chains
      const requiredChainInfo = parseChain(requiredChains[0])

      setRequiredChainInfo(requiredChainInfo)
      setProposal(proposal)
      setWcSessionState('proposal')
    },
    [setProposal, setWcSessionState]
  )

  useEffect(() => {
    walletConnectClient?.on('session_proposal', onProposal)

    return () => {
      walletConnectClient?.removeListener('session_proposal', onProposal)
    }
  }, [onProposal, walletConnectClient])

  const handleConnect = useCallback(async () => {
    try {
      await walletConnectClient?.pair({ uri })
      if (onConnect) onConnect()
    } catch (e) {
      setUri('')
      setError(`${t('Error in pairing')}: ${extractErrorMsg(e)}`)
    }
  }, [walletConnectClient, uri, onConnect, t])

  const setErrorState = useCallback((error: string): void => {
    setWcSessionState('error')
    setError(error)
  }, [])

  const chainAccounts = useCallback(
    (address: Address, chain: ChainInfo): string[] => {
      if (!isCompatibleChainGroup(address.group, chain.chainGroup)) {
        setErrorState(t`Invalid address group for the WallectConnect connection`)
      }

      return [`${formatChain(chain.networkId, chain.chainGroup)}:${address.publicKey}`]
    },
    [setErrorState, t]
  )

  const onApprove = useCallback(
    async (signerAddress: Address) => {
      if (proposal === undefined) {
        setWcSessionState('uninitialized')
        return
      }

      const { id, requiredNamespaces, relays } = proposal.params
      const requiredNamespace = requiredNamespaces[PROVIDER_NAMESPACE]

      if (requiredNamespace.chains.length !== 1) {
        setErrorState('Too many chains in the WalletConnect proposal')
        return
      }

      const requiredChain = parseChain(requiredNamespace.chains[0])

      if (requiredChain.networkId !== (await client?.web3.infos.getInfosChainParams())?.networkId) {
        setErrorState('The current network is unmatched with the network requested by WalletConnect')
        return
      }

      const namespaces: SessionTypes.Namespaces = {
        alephium: {
          methods: requiredNamespace.methods,
          events: requiredNamespace.events,
          accounts: chainAccounts(signerAddress, requiredChain)
        }
      }

      if (!isCompatibleChainGroup(signerAddress.group, requiredChain.chainGroup)) {
        setErrorState(
          `Not all chain requested has at least one corresponding account. Chains requested: ${JSON.stringify(
            requiredChainInfo
          )}. Available accounts: ${namespaces.alephium.accounts}`
        )
        return
      }

      if (!walletConnectClient) return

      const { acknowledged } = await walletConnectClient.approve({
        id,
        relayProtocol: relays[0].protocol,
        namespaces
      })

      await acknowledged()

      onClose()
    },
    [chainAccounts, client?.web3.infos, onClose, proposal, requiredChainInfo, setErrorState, walletConnectClient]
  )

  const onReject = async () => {
    if (proposal === undefined) {
      setWcSessionState('uninitialized')
      return
    }

    await walletConnectClient?.reject({
      id: proposal.id,
      reason: {
        code: 123, // TODO: Fix this
        message: 'reject me' // TODO: Fix this
      }
    })
    onClose()
  }

  if (!walletConnectClient) return null

  if (error) {
    return (
      <CenteredModal
        title={<ImageStyled src={walletConnectFull} />}
        subtitle={t`WalletConnect error`}
        onClose={onClose}
      >
        {error}
        <ModalFooterButtons>
          <ModalFooterButton
            onClick={() => {
              setWcSessionState('uninitialized')
              setError('')
            }}
          >
            {t`Try again`}
          </ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
    )
  } else if (wcSessionState === 'uninitialized') {
    return (
      <CenteredModal title={<ImageStyled src={walletConnectFull} />} subtitle={t`Connect to a dApp`} onClose={onClose}>
        <Input onChange={(t) => setUri(t.target.value)} value={uri} label={t`Paste what was copied from the dApp`} />
        <ModalFooterButtons>
          <ModalFooterButton secondary onClick={onClose}>
            {t`Cancel`}
          </ModalFooterButton>
          <ModalFooterButton onClick={handleConnect} disabled={uri === ''}>
            {t`Connect`}
          </ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
    )
  } else if (wcSessionState === 'proposal' && signerAddress) {
    const metadata = proposal?.params.proposer.metadata

    return (
      <CenteredModal
        title={<ImageStyled src={walletConnectFull} />}
        subtitle={t`Approve the proposal to connect`}
        onClose={onClose}
      >
        <Section>
          <InfoBox>
            <Info>{t`Please review the following before authorizing the dApp`}:</Info>
            <List>
              <Info>
                {t`Name`}: {metadata?.name ?? t`Absent dApp name`}
              </Info>
              <Info>
                {t`URL`}: {metadata?.url ?? t`Absent dApp URL`}
              </Info>
              <Info>
                {t`Description`}: {metadata?.description ?? t`Absent dApp description`}
              </Info>
              <Info>
                {t`Network ID`}: {requiredChainInfo?.networkId}
              </Info>
              <Info>
                {t`Address group`}: {requiredChainInfo?.chainGroup ?? t`all`}
              </Info>
            </List>
          </InfoBox>
        </Section>
        <Section>
          <AddressSelect
            label={t`Signer address`}
            title={t`Select an address to sign with.`}
            options={addressOptions}
            defaultAddress={signerAddress}
            onAddressChange={(newAddress) => setSignerAddress(newAddress)}
            id="from-address"
            hideEmptyAvailableBalance
          />
        </Section>
        <ModalFooterButtons>
          <ModalFooterButton secondary onClick={onReject}>
            {t`Reject`}
          </ModalFooterButton>
          <ModalFooterButton onClick={() => onApprove(signerAddress)}>{t`Approve`}</ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
    )
  }

  return null
}

export default WalletConnectModal

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
