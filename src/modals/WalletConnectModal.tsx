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

import { formatChain, isCompatibleChainGroup, parseChain } from '@alephium/walletconnect-provider'
import { ChainInfo, PROVIDER_NAMESPACE } from '@alephium/walletconnect-provider'
import { SessionTypes, SignClientTypes } from '@walletconnect/types'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import Input from '../components/Inputs/Input'
import { Address, useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import { useWalletConnectContext } from '../contexts/walletconnect'
import walletConnectFull from '../images/wallet-connect-full.svg'
import { extractErrorMsg } from '../utils/misc'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'
import { useSignerAddress } from './SendModal/utils'

interface Props {
  onClose: () => void
  onConnect?: () => void
}

enum State {
  Error,
  InitiateSession,
  Proposal,
  RequireUnlock
}

const WalletConnectModal = ({ onClose, onConnect }: Props) => {
  const { client } = useGlobalContext()
  const { addresses } = useAddressesContext()
  const { walletConnect } = useWalletConnectContext()
  const [uri, setUri] = useState('')
  const [state, setState] = useState(addresses.length > 0 ? State.InitiateSession : State.RequireUnlock)

  const [proposal, setProposal] = useState<SignClientTypes.EventArguments['session_proposal']>()

  const [requiredChainInfo, setRequiredChainInfo] = useState<ChainInfo>()

  const [signerAddress, SignerAddress] = useSignerAddress(requiredChainInfo?.chainGroup)
  const [error, setError] = useState('')

  const onProposal = useCallback(
    async (proposal: SignClientTypes.EventArguments['session_proposal']) => {
      const { requiredNamespaces } = proposal.params
      const requiredChains = requiredNamespaces[PROVIDER_NAMESPACE].chains
      const requiredChainInfo = parseChain(requiredChains[0])

      setRequiredChainInfo(requiredChainInfo)
      setProposal(proposal)
      setState(State.Proposal)
    },
    [setProposal, setState]
  )

  useEffect(() => {
    walletConnect?.on('session_proposal', onProposal)
    return () => {
      walletConnect?.removeListener('session_proposal', onProposal)
    }
  }, [onClose, onProposal, walletConnect])

  const onInitiate = useCallback(async () => {
    walletConnect
      ?.pair({ uri })
      .then((e) => {
        onConnect && onConnect()
      })
      .catch((e) => {
        setUri('')
        setErrorState(`Error in pairing: ${extractErrorMsg(e)}`)
      })
  }, [walletConnect, uri, onConnect])

  function chainAccounts(address: Address, chain: ChainInfo): string[] {
    if (!isCompatibleChainGroup(address.group, chain.chainGroup)) {
      setErrorState('Invalid address group for the WallectConnect connection')
    }

    return [`${formatChain(chain.networkId, chain.chainGroup)}:${address.publicKey}`]
  }

  const onApprove = useCallback(
    async (signerAddress: Address) => {
      if (proposal === undefined) {
        setState(State.InitiateSession)
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

      if (walletConnect) {
        const { acknowledged } = await walletConnect.approve({
          id,
          relayProtocol: relays[0].protocol,
          namespaces
        })

        await acknowledged()
      }

      onClose()
    },
    [walletConnect, proposal, requiredChainInfo, addresses, onClose, addresses]
  )

  const onReject = useCallback(async () => {
    if (proposal === undefined) {
      setState(State.InitiateSession)
      return
    }

    await walletConnect?.reject({
      id: proposal.id,
      reason: {
        code: 123, // TODO: Fix this
        message: 'reject me' // TODO: Fix this
      }
    })
    onClose()
  }, [walletConnect, proposal, onClose])

  const setErrorState = useCallback((error: string): void => {
    setState(State.Error)
    setError(error)
  }, [])

  switch (state) {
    case State.Error:
      return (
        <CenteredModal
          title={<WalletConnectTitle src={walletConnectFull} />}
          subtitle="WalletConnect Error"
          onClose={onClose}
        >
          <div>{error}</div>
          <ModalFooterButtons>
            <ModalFooterButton
              onClick={() => {
                setState(State.InitiateSession)
                setError('')
              }}
            >
              Ok
            </ModalFooterButton>
          </ModalFooterButtons>
        </CenteredModal>
      )
    case State.InitiateSession:
      return (
        <CenteredModal
          title={<WalletConnectTitle src={walletConnectFull} />}
          subtitle="Initiate a session with a dApp"
          onClose={onClose}
        >
          <Input onChange={(t) => setUri(t.target.value)} value={uri} label="Paste what was copied from the dApp" />
          <ModalFooterButtons>
            <ModalFooterButton secondary onClick={onClose}>
              Cancel
            </ModalFooterButton>
            <ModalFooterButton onClick={onInitiate} disabled={uri === ''}>
              Connect
            </ModalFooterButton>
          </ModalFooterButtons>
        </CenteredModal>
      )
    case State.Proposal: {
      const name = proposal?.params.proposer.metadata.name ?? 'No application name'
      const url = proposal?.params.proposer.metadata.url ?? 'No URL specified'
      const description = proposal?.params.proposer.metadata.description ?? 'No description given'

      return (
        <CenteredModal
          title={<WalletConnectTitle src={walletConnectFull} />}
          subtitle="Approve the proposal to connect"
          onClose={onClose}
        >
          <Notice>Please review the following before authorizing the dApp</Notice>
          <List>
            <Name>{name}</Name>
            <Url>{url}</Url>
            <Desc>{description}</Desc>
            <Desc>NetworkId: {requiredChainInfo?.networkId}</Desc>
            <Desc>Address group: {requiredChainInfo?.chainGroup ?? 'all'}</Desc>
          </List>
          {SignerAddress}
          <ModalFooterButtons>
            <ModalFooterButton secondary onClick={onReject}>
              Reject
            </ModalFooterButton>
            <ModalFooterButton onClick={() => onApprove(signerAddress)}>Approve</ModalFooterButton>
          </ModalFooterButtons>
        </CenteredModal>
      )
    }
    case State.RequireUnlock:
      return (
        <CenteredModal
          title={<WalletConnectTitle src={walletConnectFull} />}
          subtitle="Initiate a session with a dApp"
          onClose={onClose}
        >
          <div>Please unlock a wallet.</div>
          <ModalFooterButtons>
            <ModalFooterButton onClick={onClose}>Ok</ModalFooterButton>
          </ModalFooterButtons>
        </CenteredModal>
      )
    default:
      return <div>Unknown state</div>
  }
}

export default WalletConnectModal

const WalletConnectTitle = styled.img`
  width: 12rem;
`

const Notice = styled.div`
  border: solid 1px #ccc;
  border-radius: 4px;
  background-color: #f0f0f0;
  font-size: 13px;
  padding: 1em;
  margin: 1em 0;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 1em;
`

const Name = styled.div`
  font-size: 14px;
`
const Url = styled.div`
  font-size: 10px;
  margin-bottom: 1em;
`
const Desc = styled.div`
  margin-bottom: 1em;
`
