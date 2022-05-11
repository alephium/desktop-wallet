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

import Input from '../components/Inputs/Input'
import { useAddressesContext, Address } from '../contexts/addresses'
import { useWalletConnectContext } from '../contexts/walletconnect'
import walletConnectFull from '../images/wallet-connect-full.svg'
import { extractErrorMsg } from '../utils/misc'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'
import { useFromAddress, useSignerAddress } from './SendModal/utils'

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
  const { addresses } = useAddressesContext()
  const { walletConnect } = useWalletConnectContext()
  const [uri, setUri] = useState('')
  const [state, setState] = useState(addresses.length > 0 ? State.InitiateSession : State.RequireUnlock)
  const [proposal, setProposal] = useState<SessionTypes.Proposal>()
  const [permittedChain, setPermittedChain] = useState({
    chainId: formatChain(0, -1),
    networkId: 0,
    permittedGroup: -1
  })

  const [fromAddress, FromAddress] = useSignerAddress(permittedChain.permittedGroup)
  const [error, setError] = useState('')

  const onProposal = useCallback(
    async (proposal: SessionTypes.Proposal) => {
      const permittedChain = proposal.permissions.blockchain.chains[0]
      if (typeof permittedChain === 'undefined') {
        setErrorState('No chain is permitted')
        return
      }
      const [permittedNetworkId, permittedChainGroup] = parseChain(permittedChain)
      setPermittedChain({ chainId: permittedChain, networkId: permittedNetworkId, permittedGroup: permittedChainGroup })
      setProposal(proposal)
      setState(State.Proposal)
    },
    [setProposal, setState]
  )

  useEffect(() => {
    walletConnect?.on(CLIENT_EVENTS.session.proposal, onProposal)
    walletConnect?.on(CLIENT_EVENTS.session.created, onClose)
    return () => {
      walletConnect?.removeListener(CLIENT_EVENTS.session.proposal, onProposal)
      walletConnect?.removeListener(CLIENT_EVENTS.session.created, onClose)
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

  const onApprove = useCallback(
    async (signerAddress: Address) => {
      if (proposal === undefined) {
        setState(State.InitiateSession)
        return
      }

      const accounts: string[] = [
        formatAccount(permittedChain.chainId, {
          address: signerAddress.hash,
          pubkey: signerAddress.publicKey,
          group: signerAddress.group
        })
      ]
      await walletConnect?.approve({ proposal, response: { state: { accounts } } })
      onClose()
    },
    [walletConnect, proposal, addresses, onClose]
  )

  const onReject = useCallback(async () => {
    if (proposal === undefined) {
      setState(State.InitiateSession)
      return
    }

    await walletConnect?.reject({ proposal })
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
          <Input
            onChange={(t) => setUri(t.target.value)}
            value={uri}
            placeholder="Paste what was copied from the dApp"
          />
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
      const name = proposal?.proposer.metadata.name ?? 'No application name'
      const url = proposal?.proposer.metadata.url ?? 'No URL specified'
      const description = proposal?.proposer.metadata.description ?? 'No description given'

      if (typeof fromAddress === 'undefined') {
        setErrorState(`No address with balance for group ${permittedChain.permittedGroup}`)
        return <></>
      }

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
            <Desc>
              NetworkId: {permittedChain.networkId}, Group:{' '}
              {permittedChain.permittedGroup == -1 ? 'all' : permittedChain.permittedGroup}
            </Desc>
          </List>
          {FromAddress}
          <ModalFooterButtons>
            <ModalFooterButton secondary onClick={onReject}>
              Reject
            </ModalFooterButton>
            <ModalFooterButton onClick={() => onApprove(fromAddress)}>Approve</ModalFooterButton>
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
