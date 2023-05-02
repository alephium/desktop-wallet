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
import { SignResult } from '@alephium/sdk/api/alephium'
import { ALPH } from '@alephium/token-list'
import { ChainInfo, parseChain, PROVIDER_NAMESPACE, RelayMethod } from '@alephium/walletconnect-provider'
import {
  ApiRequestArguments,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignTransferTxParams
} from '@alephium/web3'
import SignClient from '@walletconnect/sign-client'
import { EngineTypes, SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { partition } from 'lodash'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import client from '@/api/client'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import SendModalCallContract from '@/modals/SendModals/CallContract'
import SendModalDeployContract from '@/modals/SendModals/DeployContract'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { walletConnectPairingFailed } from '@/storage/dApps/dAppActions'
import { AssetAmount } from '@/types/assets'
import {
  CallContractTxData,
  DappTxData,
  DeployContractTxData,
  TransferTxData,
  TxDataToModalType,
  TxType
} from '@/types/transactions'
import { AlephiumWindow } from '@/types/window'
import { WALLETCONNECT_ERRORS } from '@/utils/constants'

type RequestEvent = SignClientTypes.EventArguments['session_request']
type ProposalEvent = SignClientTypes.EventArguments['session_proposal']

type WalletConnectSessionState = 'uninitialized' | 'proposal' | 'initialized'

export interface WalletConnectContextProps {
  walletConnectClient?: SignClient
  requestEvent?: RequestEvent
  proposalEvent?: ProposalEvent
  dappTxData?: DappTxData
  onSessionRequestError: (event: RequestEvent, error: ReturnType<typeof getSdkError>) => Promise<void>
  onSessionRequestSuccess: (event: RequestEvent, result: SignResult) => Promise<void>
  onSessionDelete: () => void
  connectToWalletConnect: (uri: string) => void
  requiredChainInfo?: ChainInfo
  wcSessionState: WalletConnectSessionState
  sessionTopic?: string
  onProposalApprove: (topic: string) => void
  connectedDAppMetadata?: ProposalEvent['params']['proposer']['metadata']
}

const initialContext: WalletConnectContextProps = {
  walletConnectClient: undefined,
  dappTxData: undefined,
  requestEvent: undefined,
  onSessionRequestError: () => Promise.resolve(),
  onSessionRequestSuccess: () => Promise.resolve(),
  connectToWalletConnect: () => null,
  requiredChainInfo: undefined,
  wcSessionState: 'uninitialized',
  sessionTopic: undefined,
  onSessionDelete: () => null,
  onProposalApprove: () => null,
  connectedDAppMetadata: undefined
}

const WalletConnectContext = createContext<WalletConnectContextProps>(initialContext)

const _window = window as unknown as AlephiumWindow
const electron = _window.electron

export const WalletConnectContextProvider: FC = ({ children }) => {
  const { t } = useTranslation()
  const addresses = useAppSelector(selectAllAddresses)
  const dispatch = useAppDispatch()

  const [isDeployContractSendModalOpen, setIsDeployContractSendModalOpen] = useState(false)
  const [isCallScriptSendModalOpen, setIsCallScriptSendModalOpen] = useState(false)

  const [walletConnectClient, setWalletConnectClient] = useState(initialContext.walletConnectClient)
  const [dappTxData, setDappTxData] = useState(initialContext.dappTxData)
  const [requestEvent, setRequestEvent] = useState(initialContext.requestEvent)
  const [wcSessionState, setWcSessionState] = useState(initialContext.wcSessionState)
  const [proposalEvent, setProposalEvent] = useState(initialContext.proposalEvent)
  const [requiredChainInfo, setRequiredChainInfo] = useState(initialContext.requiredChainInfo)
  const [sessionTopic, setSessionTopic] = useState(initialContext.sessionTopic)
  const [connectedDAppMetadata, setConnectedDappMetadata] = useState(initialContext.connectedDAppMetadata)

  const initializeWalletConnectClient = useCallback(async () => {
    try {
      const client = await SignClient.init({
        projectId: '6e2562e43678dd68a9070a62b6d52207',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Alephium desktop wallet',
          description: 'Alephium desktop wallet',
          url: 'https://github.com/alephium/desktop-wallet/releases',
          icons: ['https://alephium.org/favicon-32x32.png']
        }
      })

      setWalletConnectClient(client)
    } catch (e) {
      console.error('Could not initialize WalletConnect client', e)
    }
  }, [])

  useEffect(() => {
    if (!walletConnectClient) initializeWalletConnectClient()
  }, [initializeWalletConnectClient, walletConnectClient])

  const onSessionRequestResponse = useCallback(
    async (event: RequestEvent, response: EngineTypes.RespondParams['response']) => {
      if (!walletConnectClient) return

      await walletConnectClient.respond({ topic: event.topic, response })
      setRequestEvent(undefined)
      setDappTxData(undefined)
    },
    [walletConnectClient]
  )

  const onSessionRequestSuccess = async (event: RequestEvent, result: SignResult) =>
    await onSessionRequestResponse(event, { id: event.id, jsonrpc: '2.0', result })

  const onSessionRequestError = useCallback(
    async (event: RequestEvent, error: ReturnType<typeof getSdkError>) =>
      await onSessionRequestResponse(event, { id: event.id, jsonrpc: '2.0', error }),
    [onSessionRequestResponse]
  )

  const onSessionProposal = useCallback(async (proposalEvent: ProposalEvent) => {
    const { requiredNamespaces } = proposalEvent.params
    const requiredChains = requiredNamespaces[PROVIDER_NAMESPACE].chains
    const requiredChainInfo = requiredChains ? parseChain(requiredChains[0]) : undefined

    setRequiredChainInfo(requiredChainInfo)
    setProposalEvent(proposalEvent)
    setWcSessionState('proposal')
  }, [])

  const onSessionRequest = useCallback(
    async (event: RequestEvent) => {
      if (!walletConnectClient) return

      setRequestEvent(event)

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
          case 'alph_requestNodeApi': {
            const p = request.params as ApiRequestArguments
            const result = await client.web3.request(p)

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
            onSessionRequestError(event, getSdkError('WC_METHOD_UNSUPPORTED'))
            throw new Error(`Method not supported: ${request.method}`)
        }
      } catch (e) {
        console.error('Error while parsing WalletConnect session request', e)
        onSessionRequestError(event, {
          message: getHumanReadableError(e, 'Error while parsing WalletConnect session request'),
          code: WALLETCONNECT_ERRORS.PARSING_SESSION_REQUEST_FAILED
        })
      }
    },
    [addresses, onSessionRequestError, walletConnectClient]
  )

  const connectToWalletConnect = useCallback(
    async (uri: string) => {
      if (!walletConnectClient || !uri) return

      try {
        return await walletConnectClient.pair({ uri })
      } catch (e) {
        console.error('Could not pair with WalletConnect', e)
        dispatch(walletConnectPairingFailed(getHumanReadableError(e, t('Could not pair with WalletConnect'))))
      }
    },
    [dispatch, t, walletConnectClient]
  )

  const onSessionDelete = useCallback(() => {
    setRequiredChainInfo(undefined)
    setProposalEvent(undefined)
    setWcSessionState('uninitialized')
    setSessionTopic(undefined)
  }, [])

  const onProposalApprove = (topic: string) => {
    setSessionTopic(topic)
    setConnectedDappMetadata(proposalEvent?.params.proposer.metadata)
    setProposalEvent(undefined)
    setWcSessionState('initialized')
  }

  useEffect(() => {
    if (!walletConnectClient) return

    walletConnectClient.on('session_request', onSessionRequest)
    walletConnectClient.on('session_proposal', onSessionProposal)
    walletConnectClient.on('session_delete', onSessionDelete)

    return () => {
      walletConnectClient.removeListener('session_request', onSessionRequest)
      walletConnectClient.removeListener('session_proposal', onSessionProposal)
      walletConnectClient.removeListener('session_delete', onSessionDelete)
    }
  }, [onSessionDelete, onSessionProposal, onSessionRequest, walletConnectClient])

  useEffect(() => {
    const connectAndReset = async (uri: string) => {
      await connectToWalletConnect(uri)
      electron?.walletConnect.resetDeepLinkUri()
    }

    const uri = electron?.walletConnect.getDeepLinkUri()

    if (uri) {
      connectAndReset(uri)
    } else {
      electron?.walletConnect.onConnect(connectAndReset)
    }
  }, [connectToWalletConnect])

  return (
    <WalletConnectContext.Provider
      value={{
        requestEvent,
        proposalEvent,
        walletConnectClient,
        dappTxData,
        onSessionRequestError,
        onSessionRequestSuccess,
        connectToWalletConnect,
        requiredChainInfo,
        wcSessionState,
        onSessionDelete,
        sessionTopic,
        onProposalApprove,
        connectedDAppMetadata
      }}
    >
      {children}
      <ModalPortal>
        {isDeployContractSendModalOpen && dappTxData && (
          <SendModalDeployContract
            initialTxData={dappTxData}
            txData={dappTxData as DeployContractTxData}
            onClose={() => setIsDeployContractSendModalOpen(false)}
          />
        )}
        {isCallScriptSendModalOpen && dappTxData && (
          <SendModalCallContract
            initialStep="info-check"
            initialTxData={dappTxData}
            txData={dappTxData as CallContractTxData}
            onClose={() => setIsCallScriptSendModalOpen(false)}
          />
        )}
      </ModalPortal>
    </WalletConnectContext.Provider>
  )
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
