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

import { AssetAmount, getHumanReadableError } from '@alephium/sdk'
import { ALPH } from '@alephium/token-list'
import { formatChain, isCompatibleAddressGroup, RelayMethod } from '@alephium/walletconnect-provider'
import {
  ApiRequestArguments,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignTransferTxParams,
  SignUnsignedTxParams,
  SignUnsignedTxResult
} from '@alephium/web3'
import { node } from '@alephium/web3'
import SignClient from '@walletconnect/sign-client'
import { EngineTypes, SessionTypes, SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { partition } from 'lodash'
import { usePostHog } from 'posthog-js/react'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import client from '@/api/client'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import SendModalCallContract from '@/modals/SendModals/CallContract'
import SendModalDeployContract from '@/modals/SendModals/DeployContract'
import SignUnsignedTxModal from '@/modals/SendModals/SignUnsignedTxModal'
import WalletConnectSessionProposalModal from '@/modals/WalletConnect/WalletConnectSessionProposalModal'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { walletConnectPairingFailed, walletConnectProposalApprovalFailed } from '@/storage/dApps/dAppActions'
import { Address } from '@/types/addresses'
import {
  CallContractTxData,
  DappTxData,
  DeployContractTxData,
  SignUnsignedTxData,
  TransferTxData,
  TxDataToModalType,
  TxType
} from '@/types/transactions'
import { SessionProposalEvent, SessionRequestEvent } from '@/types/walletConnect'
import { AlephiumWindow } from '@/types/window'
import { WALLETCONNECT_ERRORS } from '@/utils/constants'
import { getActiveWalletConnectSessions, isNetworkValid, parseSessionProposalEvent } from '@/utils/walletConnect'

export interface WalletConnectContextProps {
  walletConnectClient?: SignClient
  pairWithDapp: (uri: string) => void
  unpairFromDapp: (pairingTopic: string) => Promise<void>
  dappTxData?: DappTxData
  activeSessions: SessionTypes.Struct[]
  dAppUrlToConnectTo?: string
}

const initialContext: WalletConnectContextProps = {
  walletConnectClient: undefined,
  pairWithDapp: () => null,
  unpairFromDapp: () => Promise.resolve(),
  dappTxData: undefined,
  activeSessions: [],
  dAppUrlToConnectTo: undefined
}

const WalletConnectContext = createContext<WalletConnectContextProps>(initialContext)

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

export const WalletConnectContextProvider: FC = ({ children }) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
  const currentNetwork = useAppSelector((s) => s.network)
  const mnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const dispatch = useAppDispatch()
  const posthog = usePostHog()

  const [isSessionProposalModalOpen, setIsSessionProposalModalOpen] = useState(false)
  const [isDeployContractSendModalOpen, setIsDeployContractSendModalOpen] = useState(false)
  const [isCallScriptSendModalOpen, setIsCallScriptSendModalOpen] = useState(false)
  const [isSignUnsignedTxModalOpen, setIsSignUnsignedTxModalOpen] = useState(false)

  const [walletConnectClient, setWalletConnectClient] = useState(initialContext.walletConnectClient)
  const [activeSessions, setActiveSessions] = useState(initialContext.activeSessions)
  const [dappTxData, setDappTxData] = useState(initialContext.dappTxData)
  const [sessionRequestEvent, setSessionRequestEvent] = useState<SessionRequestEvent>()
  const [sessionProposalEvent, setSessionProposalEvent] = useState<SessionProposalEvent>()

  const isAuthenticated = !!mnemonic

  const initializeWalletConnectClient = useCallback(async () => {
    try {
      console.log('⏳ INITIALIZING WC CLIENT...')
      const client = await SignClient.init({
        projectId: '6e2562e43678dd68a9070a62b6d52207',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Alephium desktop wallet',
          description: 'Alephium desktop wallet',
          url: 'https://github.com/alephium/desktop-wallet',
          icons: ['https://alephium.org/favicon-32x32.png']
        }
      })
      console.log('✅ INITIALIZING WC CLIENT: DONE!')

      setWalletConnectClient(client)
      setActiveSessions(getActiveWalletConnectSessions(client))
    } catch (e) {
      posthog.capture('Error', { message: 'Could not initialize WalletConnect client' })
      console.error('Could not initialize WalletConnect client', e)
    }
  }, [posthog])

  const respondToWalletConnect = useCallback(
    async (event: SessionRequestEvent, response: EngineTypes.RespondParams['response']) => {
      if (!walletConnectClient) return

      console.log('⏳ RESPONDING TO WC WITH:', { topic: event.topic, response })
      await walletConnectClient.respond({ topic: event.topic, response })
      console.log('✅ RESPONDING: DONE!')

      setSessionRequestEvent(undefined)
      setDappTxData(undefined)
    },
    [walletConnectClient]
  )

  const respondToWalletConnectWithSuccess = async (event: SessionRequestEvent, result: node.SignResult) =>
    await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', result })

  const respondToWalletConnectWithError = useCallback(
    async (event: SessionRequestEvent, error: ReturnType<typeof getSdkError>) =>
      await respondToWalletConnect(event, { id: event.id, jsonrpc: '2.0', error }),
    [respondToWalletConnect]
  )

  const onSessionProposal = useCallback(async (sessionProposalEvent: SessionProposalEvent) => {
    console.log('📣 RECEIVED EVENT PROPOSAL TO CONNECT TO A DAPP!')
    console.log('👉 ARGS:', sessionProposalEvent)
    console.log('⏳ WAITING FOR PROPOSAL APPROVAL OR REJECTION')

    setSessionProposalEvent(sessionProposalEvent)
    setIsSessionProposalModalOpen(true)
  }, [])

  const onSessionRequest = useCallback(
    async (event: SessionRequestEvent) => {
      if (!walletConnectClient) return

      setSessionRequestEvent(event)

      const getSignerAddressByHash = (hash: string) => {
        const address = addresses.find((a) => a.hash === hash)
        if (!address) throw new Error(`Unknown signer address: ${hash}`)

        return address
      }

      const setTxDataAndOpenModal = ({ txData, modalType }: TxDataToModalType) => {
        setDappTxData(txData)

        if (modalType === TxType.DEPLOY_CONTRACT) {
          setIsDeployContractSendModalOpen(true)
        } else if (modalType === TxType.SCRIPT) {
          setIsCallScriptSendModalOpen(true)
        } else if (modalType === TxType.SIGN_UNSIGNED_TX) {
          setIsSignUnsignedTxModalOpen(true)
        }

        electron?.app.show()
      }

      const {
        params: { request }
      } = event

      try {
        switch (request.method as RelayMethod) {
          case 'alph_signAndSubmitTransferTx': {
            const p = request.params as SignTransferTxParams
            const dest = p.destinations[0]

            const txData: TransferTxData = {
              fromAddress: getSignerAddressByHash(p.signerAddress),
              toAddress: p.destinations[0].address,
              assetAmounts: [
                { id: ALPH.id, amount: BigInt(dest.attoAlphAmount) },
                ...(dest.tokens ? dest.tokens.map((token) => ({ ...token, amount: BigInt(token.amount) })) : [])
              ],
              gasAmount: p.gasAmount,
              gasPrice: p.gasPrice?.toString()
            }

            setTxDataAndOpenModal({ txData, modalType: TxType.TRANSFER })
            break
          }
          case 'alph_signAndSubmitDeployContractTx': {
            const { initialAttoAlphAmount, bytecode, issueTokenAmount, gasAmount, gasPrice, signerAddress } =
              request.params as SignDeployContractTxParams
            const initialAlphAmount: AssetAmount | undefined = initialAttoAlphAmount
              ? { id: ALPH.id, amount: BigInt(initialAttoAlphAmount) }
              : undefined

            const txData: DeployContractTxData = {
              fromAddress: getSignerAddressByHash(signerAddress),
              bytecode,
              initialAlphAmount,
              issueTokenAmount: issueTokenAmount?.toString(),
              gasAmount,
              gasPrice: gasPrice?.toString()
            }

            setTxDataAndOpenModal({ txData, modalType: TxType.DEPLOY_CONTRACT })
            break
          }
          case 'alph_signAndSubmitExecuteScriptTx': {
            const { tokens, bytecode, gasAmount, gasPrice, signerAddress, attoAlphAmount } =
              request.params as SignExecuteScriptTxParams
            let assetAmounts: AssetAmount[] = []
            let allAlphAssets: AssetAmount[] = attoAlphAmount ? [{ id: ALPH.id, amount: BigInt(attoAlphAmount) }] : []

            if (tokens) {
              const assets = tokens.map((token) => ({ id: token.id, amount: BigInt(token.amount) }))
              const [alphAssets, tokenAssets] = partition(assets, (asset) => asset.id === ALPH.id)

              assetAmounts = tokenAssets
              allAlphAssets = [...allAlphAssets, ...alphAssets]
            }

            if (allAlphAssets.length > 0) {
              assetAmounts.push({
                id: ALPH.id,
                amount: allAlphAssets.reduce((total, asset) => total + (asset.amount ?? BigInt(0)), BigInt(0))
              })
            }

            const txData: CallContractTxData = {
              fromAddress: getSignerAddressByHash(signerAddress),
              bytecode,
              assetAmounts,
              gasAmount,
              gasPrice: gasPrice?.toString()
            }

            setTxDataAndOpenModal({ txData, modalType: TxType.SCRIPT })
            break
          }
          case 'alph_signUnsignedTx': {
            const { unsignedTx, signerAddress } = request.params as SignUnsignedTxParams
            const txData: SignUnsignedTxData = {
              fromAddress: getSignerAddressByHash(signerAddress),
              unsignedTx
            }
            setTxDataAndOpenModal({ txData, modalType: TxType.SIGN_UNSIGNED_TX })
            break
          }
          case 'alph_requestNodeApi': {
            const p = request.params as ApiRequestArguments
            const result = await client.node.request(p)

            await walletConnectClient.respond({
              topic: event.topic,
              response: { id: event.id, jsonrpc: '2.0', result }
            })
            break
          }
          case 'alph_requestExplorerApi': {
            const p = request.params as ApiRequestArguments
            // TODO: Remove following code when using explorer client from web3 library
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const call = (client.explorer as any)[`${p.path}`][`${p.method}`] as (...arg0: any[]) => Promise<any>
            const result = await call(...p.params)

            await walletConnectClient.respond({
              topic: event.topic,
              response: { id: event.id, jsonrpc: '2.0', result }
            })
            break
          }
          default:
            // TODO: support all of the other SignerProvider methods
            respondToWalletConnectWithError(event, getSdkError('WC_METHOD_UNSUPPORTED'))
            throw new Error(`Method not supported: ${request.method}`)
        }
      } catch (e) {
        console.error('Error while parsing WalletConnect session request', e)
        posthog.capture('Error', { message: 'Could not parse WalletConnect session request' })
        respondToWalletConnectWithError(event, {
          message: getHumanReadableError(e, 'Error while parsing WalletConnect session request'),
          code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED
        })
      }
    },
    [addresses, respondToWalletConnectWithError, posthog, walletConnectClient]
  )

  const pairWithDapp = useCallback(
    async (uri: string) => {
      if (!walletConnectClient) return

      const pairingTopic = uri.substring('wc:'.length, uri.indexOf('@'))

      try {
        const pairings = walletConnectClient.core.pairing.pairings
        const existingPairing = pairings.values.find(({ topic }) => topic === pairingTopic)

        if (existingPairing) {
          console.log('⏳ TRYING TO CONNECT WITH EXISTING PAIRING:', pairingTopic)
          if (!existingPairing.active) {
            console.log('⏳ EXISTING PAIRING IS INACTIVE, ACTIVATING IT...')
            // `activate` doesn't trigger the onSessionProposal as the `pair` does (even if we call `pair` or `connect`)
            // despite what the docs say (https://specs.walletconnect.com/2.0/specs/clients/sign/session-events#session_proposal)
            // so we manually check for pending requests in the history that match with the pairingTopic and trigger
            // onSessionProposal.
            await walletConnectClient.core.pairing.activate({ topic: existingPairing.topic })
            console.log('✅ ACTIVATING PAIRING: DONE!')
          }
          console.log('✅ CONNECTING: DONE!')

          console.log('⏳ LOOKING FOR PENDING PROPOSAL REQUEST...')
          const pendingProposal = walletConnectClient.core.history.pending.find(
            ({ topic, request }) => topic === existingPairing.topic && request.method === 'wc_sessionPropose'
          )
          if (pendingProposal) {
            console.log('👉 FOUND PENDING PROPOSAL REQUEST!')
            onSessionProposal({
              ...pendingProposal.request,
              params: {
                id: pendingProposal.request.id,
                ...pendingProposal.request.params
              }
            })
          }
        } else {
          console.log('⏳ PAIRING WITH WALLETCONNECT USING URI:', uri)
          await walletConnectClient.core.pairing.pair({ uri })
          console.log('✅ PAIRING: DONE!')
        }
      } catch (e) {
        console.error('❌ COULD NOT PAIR WITH: ', uri, e)
        const errorMessage = getHumanReadableError(e, t('Could not pair with WalletConnect'))

        if (!errorMessage.includes('Pairing already exists')) {
          dispatch(walletConnectPairingFailed(errorMessage))
        }
      }
    },
    [dispatch, onSessionProposal, t, walletConnectClient]
  )

  const onSessionDelete = useCallback(
    async (args: SignClientTypes.EventArguments['session_delete']) => {
      console.log('📣 RECEIVED EVENT TO DISCONNECT FROM THE DAPP SESSION.')
      console.log('👉 ARGS:', args)
      console.log('🧹 CLEANING UP STATE.')

      setSessionProposalEvent(undefined)
      setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))
    },
    [walletConnectClient]
  )

  const onSessionUpdate = useCallback((args: SignClientTypes.EventArguments['session_update']) => {
    console.log('📣 RECEIVED EVENT TO UPDATE SESSION')
    console.log('👉 ARGS:', args)
  }, [])

  const onSessionEvent = useCallback((args: SignClientTypes.EventArguments['session_event']) => {
    console.log('📣 RECEIVED SESSION EVENT')
    console.log('👉 ARGS:', args)
  }, [])

  const onSessionPing = useCallback((args: SignClientTypes.EventArguments['session_ping']) => {
    console.log('📣 RECEIVED EVENT TO PING SESSION')
    console.log('👉 ARGS:', args)
  }, [])

  const onSessionExpire = useCallback((args: SignClientTypes.EventArguments['session_expire']) => {
    console.log('📣 RECEIVED EVENT TO EXPIRE SESSION')
    console.log('👉 ARGS:', args)
  }, [])

  const onSessionExtend = useCallback((args: SignClientTypes.EventArguments['session_extend']) => {
    console.log('📣 RECEIVED EVENT TO EXTEND SESSION')
    console.log('👉 ARGS:', args)
  }, [])

  const onProposalExpire = useCallback((args: SignClientTypes.EventArguments['proposal_expire']) => {
    console.log('📣 RECEIVED EVENT TO EXPIRE PROPOSAL')
    console.log('👉 ARGS:', args)
  }, [])

  useEffect(() => {
    if (!walletConnectClient) {
      initializeWalletConnectClient()
    } else {
      console.log('👉 SUBSCRIBING TO WALLETCONNECT SESSION EVENTS.')

      walletConnectClient.on('session_proposal', onSessionProposal)
      walletConnectClient.on('session_request', onSessionRequest)
      walletConnectClient.on('session_delete', onSessionDelete)
      walletConnectClient.on('session_update', onSessionUpdate)
      walletConnectClient.on('session_event', onSessionEvent)
      walletConnectClient.on('session_ping', onSessionPing)
      walletConnectClient.on('session_expire', onSessionExpire)
      walletConnectClient.on('session_extend', onSessionExtend)
      walletConnectClient.on('proposal_expire', onProposalExpire)

      const connectAndReset = async (uri: string) => {
        await pairWithDapp(uri)
        electron?.walletConnect.resetDeepLinkUri()
      }

      const getDeepLinkAndConnect = async () => {
        const uri = await electron?.walletConnect.getDeepLinkUri()

        if (uri) {
          connectAndReset(uri)
        } else {
          electron?.walletConnect.onConnect(async (uri: string) => {
            connectAndReset(uri)
          })
        }
      }

      getDeepLinkAndConnect()

      return () => {
        walletConnectClient.off('session_proposal', onSessionProposal)
        walletConnectClient.off('session_request', onSessionRequest)
        walletConnectClient.off('session_delete', onSessionDelete)
        walletConnectClient.off('session_update', onSessionUpdate)
        walletConnectClient.off('session_event', onSessionEvent)
        walletConnectClient.off('session_ping', onSessionPing)
        walletConnectClient.off('session_expire', onSessionExpire)
        walletConnectClient.off('session_extend', onSessionExtend)
        walletConnectClient.off('proposal_expire', onProposalExpire)
      }
    }
  }, [
    pairWithDapp,
    initializeWalletConnectClient,
    onProposalExpire,
    onSessionDelete,
    onSessionEvent,
    onSessionExpire,
    onSessionExtend,
    onSessionPing,
    onSessionProposal,
    onSessionRequest,
    onSessionUpdate,
    walletConnectClient
  ])

  const unpairFromDapp = useCallback(
    async (topic: string) => {
      if (!walletConnectClient) return

      try {
        console.log('⏳ DISCONNECTING FROM:', topic)
        await walletConnectClient.disconnect({ topic, reason: getSdkError('USER_DISCONNECTED') })
        console.log('✅ DISCONNECTING: DONE!')

        setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))

        posthog?.capture('WC: Disconnected from dApp')
      } catch (e) {
        console.error('❌ COULD NOT DISCONNECT FROM DAPP')
      }
    },
    [posthog, walletConnectClient]
  )

  const approveProposal = async (signerAddress: Address) => {
    console.log('👍 USER APPROVED PROPOSAL TO CONNECT TO THE DAPP.')
    console.log('⏳ VERIFYING USER PROVIDED DATA...')

    if (!walletConnectClient || !sessionProposalEvent) {
      console.error('❌ Could not find WalletConnect client or session proposal event')
      return
    }

    const { id, relayProtocol, requiredNamespace, requiredChains, requiredChainInfo, metadata } =
      parseSessionProposalEvent(sessionProposalEvent)

    if (requiredChains?.length !== 1) {
      dispatch(
        walletConnectProposalApprovalFailed(
          t('Too many chains in the WalletConnect proposal, expected 1, got {{ num }}', {
            num: requiredChains?.length
          })
        )
      )
      return
    }

    if (!requiredChainInfo) {
      dispatch(walletConnectProposalApprovalFailed(t('Could not find chain requirements in WalletConnect proposal')))
      return
    }

    if (!isNetworkValid(requiredChainInfo.networkId, currentNetwork.settings.networkId)) {
      dispatch(
        walletConnectProposalApprovalFailed(
          t(
            'The current network ({{ currentNetwork }}) does not match the network requested by WalletConnect ({{ walletConnectNetwork }})',
            {
              currentNetwork: currentNetwork.name,
              walletConnectNetwork: requiredChainInfo.networkId
            }
          )
        )
      )
      return
    }

    if (!isCompatibleAddressGroup(signerAddress.group, requiredChainInfo.addressGroup)) {
      dispatch(
        walletConnectProposalApprovalFailed(
          t(
            'The group of the selected address ({{ addressGroup }}) does not match the group required by WalletConnect ({{ walletConnectGroup }})',
            {
              addressGroup: signerAddress.group,
              walletConnectGroup: requiredChainInfo.addressGroup
            }
          )
        )
      )
      return
    }

    const namespaces: SessionTypes.Namespaces = {
      alephium: {
        methods: requiredNamespace.methods,
        events: requiredNamespace.events,
        accounts: [
          `${formatChain(requiredChainInfo.networkId, requiredChainInfo.addressGroup)}:${
            signerAddress.publicKey
          }/default`
        ]
      }
    }

    try {
      console.log('⏳ APPROVING PROPOSAL...')

      const existingSession = activeSessions.find((session) => session.peer.metadata.url === metadata.url)

      if (existingSession) {
        await walletConnectClient.disconnect({ topic: existingSession.topic, reason: getSdkError('USER_DISCONNECTED') })
      }

      const { topic, acknowledged } = await walletConnectClient.approve({ id, relayProtocol, namespaces })
      console.log('👉 APPROVAL TOPIC RECEIVED:', topic)
      console.log('✅ APPROVING: DONE!')

      console.log('⏳ WAITING FOR DAPP ACKNOWLEDGEMENT...')
      const res = await acknowledged()
      console.log('👉 DID DAPP ACTUALLY ACKNOWLEDGE?', res.acknowledged)

      setSessionProposalEvent(undefined)
      setActiveSessions(getActiveWalletConnectSessions(walletConnectClient))

      posthog.capture('Approved WalletConnect connection')

      electron?.app.hide()
    } catch (e) {
      console.error('❌ WC: Error while approving and acknowledging', e)
    } finally {
      setIsSessionProposalModalOpen(false)
    }
  }

  const rejectProposal = async () => {
    if (!walletConnectClient || sessionProposalEvent === undefined) return

    try {
      console.log('👎 REJECTING SESSION PROPOSAL:', sessionProposalEvent.id)
      await walletConnectClient.reject({ id: sessionProposalEvent.id, reason: getSdkError('USER_REJECTED') })
      console.log('✅ REJECTING: DONE!')

      setSessionProposalEvent(undefined)

      posthog.capture('Rejected WalletConnect connection by clicking "Reject"')

      electron?.app.hide()
    } catch (e) {
      console.error('❌ WC: Error while approving and acknowledging', e)
    } finally {
      setIsSessionProposalModalOpen(false)
    }
  }

  const handleTransactionBuildFail = async (errorMessage: string) => {
    if (sessionRequestEvent)
      await respondToWalletConnectWithError(sessionRequestEvent, {
        message: errorMessage,
        code: WALLETCONNECT_ERRORS.TRANSACTION_BUILD_FAILED
      })
  }

  const handleSessionRequestModalClose = async () => {
    if (sessionRequestEvent)
      await respondToWalletConnectWithError(sessionRequestEvent, getSdkError('USER_REJECTED_EVENTS'))
  }

  const handleSendSuccess = async (result: node.SignResult) => {
    if (sessionRequestEvent) await respondToWalletConnectWithSuccess(sessionRequestEvent, result)
  }

  const handleSendFail = async (errorMessage: string) => {
    if (sessionRequestEvent)
      await respondToWalletConnectWithError(sessionRequestEvent, {
        message: errorMessage,
        code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
      })
  }

  const handleSignSuccess = async (result: SignUnsignedTxResult) => {
    if (sessionRequestEvent) await respondToWalletConnectWithSuccess(sessionRequestEvent, result)
  }

  const handleSignFail = async (errorMessage: string) => {
    if (sessionRequestEvent)
      await respondToWalletConnectWithError(sessionRequestEvent, {
        message: errorMessage,
        code: WALLETCONNECT_ERRORS.TRANSACTION_SIGN_FAILED
      })
  }

  return (
    <WalletConnectContext.Provider
      value={{
        unpairFromDapp,
        walletConnectClient,
        dappTxData,
        pairWithDapp,
        activeSessions,
        dAppUrlToConnectTo: sessionProposalEvent?.params.proposer.metadata.url
      }}
    >
      {children}

      <ModalPortal>
        {isAuthenticated && (
          <>
            {!!sessionProposalEvent && isSessionProposalModalOpen && (
              <WalletConnectSessionProposalModal
                approveProposal={approveProposal}
                rejectProposal={rejectProposal}
                proposalEvent={sessionProposalEvent}
                onClose={() => setIsSessionProposalModalOpen(false)}
              />
            )}
            {isDeployContractSendModalOpen && dappTxData && (
              <SendModalDeployContract
                initialTxData={dappTxData}
                txData={dappTxData as DeployContractTxData}
                onClose={() => {
                  handleSessionRequestModalClose()
                  setIsDeployContractSendModalOpen(false)
                }}
                onTransactionBuildFail={(errorMessage) => {
                  handleTransactionBuildFail(errorMessage)
                  setIsDeployContractSendModalOpen(false)
                }}
                onSendSuccess={handleSendSuccess}
                onSendFail={handleSendFail}
              />
            )}
            {isCallScriptSendModalOpen && dappTxData && (
              <SendModalCallContract
                initialStep="info-check"
                initialTxData={dappTxData}
                txData={dappTxData as CallContractTxData}
                onClose={() => {
                  handleSessionRequestModalClose()
                  setIsCallScriptSendModalOpen(false)
                }}
                onTransactionBuildFail={(errorMessage) => {
                  handleTransactionBuildFail(errorMessage)
                  setIsCallScriptSendModalOpen(false)
                }}
                onSendSuccess={handleSendSuccess}
                onSendFail={handleSendFail}
              />
            )}
            {isSignUnsignedTxModalOpen && dappTxData && (
              <SignUnsignedTxModal
                txData={dappTxData as SignUnsignedTxData}
                onClose={() => {
                  handleSessionRequestModalClose()
                  setIsSignUnsignedTxModalOpen(false)
                }}
                onSignSuccess={handleSignSuccess}
                onSignFail={handleSignFail}
              />
            )}
          </>
        )}
      </ModalPortal>
    </WalletConnectContext.Provider>
  )
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
