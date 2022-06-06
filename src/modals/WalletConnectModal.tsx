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

import { CLIENT_EVENTS } from '@walletconnect/client'
import { SessionTypes } from '@walletconnect/types'
import { formatAccount, formatChain, parseChain } from 'alephium-walletconnect-provider'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import InfoBox from '../components/InfoBox'
import AddressSelect from '../components/Inputs/AddressSelect'
import Input from '../components/Inputs/Input'
import { Section } from '../components/PageComponents/PageContainers'
import { Address, useAddressesContext } from '../contexts/addresses'
import { useWalletConnectContext } from '../contexts/walletconnect'
import walletConnectFull from '../images/wallet-connect-full.svg'
import { extractErrorMsg } from '../utils/misc'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'

type WalletConnectSessionState = 'uninitialized' | 'proposal'

type PermittedChain = {
  chainId: string
  networkId: number
  permittedGroup: number | 'all'
}

interface Props {
  onClose: () => void
  onConnect?: () => void
}

const WalletConnectModal = ({ onClose, onConnect }: Props) => {
  const { walletConnectClient } = useWalletConnectContext()
  const { addresses } = useAddressesContext()
  const [uri, setUri] = useState('')
  const [error, setError] = useState('')
  const [wcSessionState, setWcSessionState] = useState<WalletConnectSessionState>('uninitialized')
  const [proposal, setProposal] = useState<SessionTypes.Proposal>()
  const [permittedChain, setPermittedChain] = useState<PermittedChain>({
    chainId: formatChain(0, -1),
    networkId: 0,
    permittedGroup: 'all'
  })
  const addressOptions =
    permittedChain.permittedGroup === 'all'
      ? addresses
      : addresses.filter((a) => a.group === permittedChain.permittedGroup)
  const [signerAddress, setSignerAddress] = useState<Address | undefined>(addressOptions.find((a) => a.settings.isMain))

  const onProposal = useCallback(async (proposal: SessionTypes.Proposal) => {
    const permittedChain = proposal.permissions.blockchain.chains[0]

    if (permittedChain === undefined) {
      setError('No chain is permitted')
      return
    }

    const [permittedNetworkId, permittedChainGroup] = parseChain(permittedChain)
    setPermittedChain({
      chainId: permittedChain,
      networkId: permittedNetworkId,
      permittedGroup: permittedChainGroup === -1 ? 'all' : permittedChainGroup
    })
    setProposal(proposal)
    setWcSessionState('proposal')
  }, [])

  useEffect(() => {
    walletConnectClient?.on(CLIENT_EVENTS.session.proposal, onProposal)
    walletConnectClient?.on(CLIENT_EVENTS.session.created, onClose)

    return () => {
      walletConnectClient?.removeListener(CLIENT_EVENTS.session.proposal, onProposal)
      walletConnectClient?.removeListener(CLIENT_EVENTS.session.created, onClose)
    }
  }, [onClose, onProposal, walletConnectClient])

  if (!walletConnectClient) return null

  const handleConnect = async () => {
    try {
      await walletConnectClient.pair({ uri })
      if (onConnect) onConnect()
    } catch (e) {
      setUri('')
      setError(`Error in pairing: ${extractErrorMsg(e)}`)
    }
  }

  const onApprove = async (signerAddress: Address) => {
    if (proposal === undefined) {
      setWcSessionState('uninitialized')
      return
    }

    const accounts: string[] = [
      formatAccount(permittedChain.chainId, {
        address: signerAddress.hash,
        publicKey: signerAddress.publicKey,
        group: signerAddress.group
      })
    ]
    await walletConnectClient.approve({ proposal, response: { state: { accounts } } })
    onClose()
  }

  const onReject = async () => {
    if (proposal === undefined) {
      setWcSessionState('uninitialized')
      return
    }

    await walletConnectClient.reject({ proposal })
    onClose()
  }

  if (error) {
    return (
      <CenteredModal title={<ImageStyled src={walletConnectFull} />} subtitle="WalletConnect Error" onClose={onClose}>
        {error}
        <ModalFooterButtons>
          <ModalFooterButton
            onClick={() => {
              setWcSessionState('uninitialized')
              setError('')
            }}
          >
            Try again
          </ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
    )
  } else if (wcSessionState === 'uninitialized') {
    return (
      <CenteredModal title={<ImageStyled src={walletConnectFull} />} subtitle="Connect to a dApp" onClose={onClose}>
        <Input onChange={(t) => setUri(t.target.value)} value={uri} label="Paste what was copied from the dApp" />
        <ModalFooterButtons>
          <ModalFooterButton secondary onClick={onClose}>
            Cancel
          </ModalFooterButton>
          <ModalFooterButton onClick={handleConnect} disabled={uri === ''}>
            Connect
          </ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
    )
  } else if (wcSessionState === 'proposal' && !signerAddress) {
    setError(`No address with balance for group ${permittedChain.permittedGroup}`)
  } else if (wcSessionState === 'proposal' && signerAddress) {
    return (
      <CenteredModal
        title={<ImageStyled src={walletConnectFull} />}
        subtitle="Approve the proposal to connect"
        onClose={onClose}
      >
        <Section>
          <InfoBox>
            <Info>Please review the following before authorizing the dApp:</Info>
            <List>
              <Info>Name: {proposal?.proposer.metadata.name ?? 'Uknown dApp name'}</Info>
              <Info>URL: {proposal?.proposer.metadata.url ?? 'Uknown dApp URL'}</Info>
              <Info>Description: {proposal?.proposer.metadata.description ?? 'Uknown dApp description'}</Info>
              <Info>NetworkId: {permittedChain.networkId}</Info>
              <Info>Group: {permittedChain.permittedGroup == -1 ? 'all' : permittedChain.permittedGroup}</Info>
            </List>
          </InfoBox>
        </Section>
        <Section>
          <AddressSelect
            label="Signer address"
            title="Select an address to sign with."
            options={addressOptions}
            defaultAddress={signerAddress}
            onAddressChange={(newAddress) => setSignerAddress(newAddress)}
            id="from-address"
            hideEmptyAvailableBalance
          />
        </Section>
        <ModalFooterButtons>
          <ModalFooterButton secondary onClick={onReject}>
            Reject
          </ModalFooterButton>
          <ModalFooterButton onClick={() => onApprove(signerAddress)}>Approve</ModalFooterButton>
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
