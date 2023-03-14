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

import { toHumanReadableAmount } from '@alephium/sdk'
import { RelayMethod } from '@alephium/walletconnect-provider'
import {
  ApiRequestArguments,
  SignDeployContractTxParams,
  SignExecuteScriptTxParams,
  SignTransferTxParams
} from '@alephium/web3'
import SignClient from '@walletconnect/sign-client'
import { SignClientTypes } from '@walletconnect/types'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'

import client from '@/api/client'
import { useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import SendModalDeployContract from '@/modals/SendModals/SendModalDeployContract'
import SendModalScript from '@/modals/SendModals/SendModalScript'
import { selectAllAddresses } from '@/storage/addresses/addressesSlice'
import { ALPH } from '@/storage/assets/assetsInfoSlice'
import {
  DappTxData,
  DeployContractTxData,
  ScriptTxData,
  TransferTxData,
  TxDataToModalType,
  TxType
} from '@/types/transactions'
import { AlephiumWindow } from '@/types/window'
import { extractErrorMsg } from '@/utils/misc'

export interface WalletConnectContextProps {
  walletConnectClient?: SignClient
  requestEvent?: SignClientTypes.EventArguments['session_request']
  dappTxData?: DappTxData
  setDappTxData: (data?: DappTxData) => void
  onError: (error: string) => void
  deepLinkUri: string
}

const initialContext: WalletConnectContextProps = {
  walletConnectClient: undefined,
  dappTxData: undefined,
  setDappTxData: () => null,
  requestEvent: undefined,
  onError: () => null,
  deepLinkUri: ''
}

const WalletConnectContext = createContext<WalletConnectContextProps>(initialContext)

export const WalletConnectContextProvider: FC = ({ children }) => {
  const addresses = useAppSelector(selectAllAddresses)

  const [isDeployContractSendModalOpen, setIsDeployContractSendModalOpen] = useState(false)
  const [isCallScriptSendModalOpen, setIsCallScriptSendModalOpen] = useState(false)

  const [walletConnectClient, setWalletConnectClient] = useState<SignClient>()
  const [dappTxData, setDappTxData] = useState<DappTxData>()
  const [requestEvent, setRequestEvent] = useState<SignClientTypes.EventArguments['session_request']>()
  const [deepLinkUri, setDeepLinkUri] = useState('')

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
    if (walletConnectClient) return

    initializeWalletConnectClient()
  }, [initializeWalletConnectClient, walletConnectClient])

  const onError = useCallback(
    (error: string): void => {
      if (!walletConnectClient || !requestEvent) return

      walletConnectClient.respond({
        topic: requestEvent.topic,
        response: {
          id: requestEvent.id,
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: error
          }
        }
      })
    },
    [walletConnectClient, requestEvent]
  )

  const onSessionRequest = useCallback(
    async (event: SignClientTypes.EventArguments['session_request']) => {
      if (!walletConnectClient) return

      const getAddressByHash = (signerAddress: string) => {
        const address = addresses.find((a) => a.hash === signerAddress)
        if (!address) throw new Error(`Unknown signer address: ${signerAddress}`)

        return address
      }

      const setTxDataAndOpenModal = ({ txData, modalType }: TxDataToModalType) => {
        setDappTxData(txData)

        if (modalType === TxType.DEPLOY_CONTRACT) {
          setIsDeployContractSendModalOpen(true)
        } else if (modalType === TxType.SCRIPT) {
          setIsCallScriptSendModalOpen(true)
        }
      }

      setRequestEvent(event)

      const {
        params: { request }
      } = event

      try {
        switch (request.method as RelayMethod) {
          case 'alph_signAndSubmitTransferTx': {
            const p = request.params as SignTransferTxParams
            const alphAssetAmount = { id: ALPH.id, amount: BigInt(p.destinations[0].attoAlphAmount) }
            const tokenAssetAmounts = p.destinations[0].tokens?.map((token) => ({
              ...token,
              amount: BigInt(token.amount)
            }))
            const txData: TransferTxData = {
              fromAddress: getAddressByHash(p.signerAddress),
              toAddress: p.destinations[0].address,
              assetAmounts: tokenAssetAmounts ? [alphAssetAmount, ...tokenAssetAmounts] : [alphAssetAmount],
              gasAmount: p.gasAmount,
              gasPrice: p.gasPrice?.toString()
            }

            setTxDataAndOpenModal({ txData, modalType: TxType.TRANSFER })
            break
          }
          case 'alph_signAndSubmitDeployContractTx': {
            const p = request.params as SignDeployContractTxParams
            const initialAlphAmount =
              p.initialAttoAlphAmount !== undefined ? toHumanReadableAmount(BigInt(p.initialAttoAlphAmount)) : undefined
            const txData: DeployContractTxData = {
              fromAddress: getAddressByHash(p.signerAddress),
              bytecode: p.bytecode,
              initialAlphAmount: initialAlphAmount,
              issueTokenAmount: p.issueTokenAmount?.toString(),
              gasAmount: p.gasAmount,
              gasPrice: p.gasPrice?.toString()
            }

            setTxDataAndOpenModal({ txData, modalType: TxType.DEPLOY_CONTRACT })
            break
          }
          case 'alph_signAndSubmitExecuteScriptTx': {
            const p = request.params as SignExecuteScriptTxParams
            const alphAmount =
              p.attoAlphAmount !== undefined ? toHumanReadableAmount(BigInt(p.attoAlphAmount)) : undefined
            const txData: ScriptTxData = {
              fromAddress: getAddressByHash(p.signerAddress),
              bytecode: p.bytecode,
              alphAmount: alphAmount,
              gasAmount: p.gasAmount,
              gasPrice: p.gasPrice?.toString()
            }

            setTxDataAndOpenModal({ txData, modalType: TxType.SCRIPT })
            break
          }
          case 'alph_requestNodeApi': {
            const p = request.params as ApiRequestArguments
            const result = await client.web3.request(p)
            await walletConnectClient.respond({
              topic: event.topic,
              response: {
                id: event.id,
                jsonrpc: '2.0',
                result
              }
            })
            break
          }
          case 'alph_requestExplorerApi': {
            const p = request.params as ApiRequestArguments
            const result = await client.explorer.request(p)
            await walletConnectClient.respond({
              topic: event.topic,
              response: {
                id: event.id,
                jsonrpc: '2.0',
                result
              }
            })
            break
          }
          default:
            // TODO: support all of the other SignerProvider methods
            throw new Error(`Method not supported: ${request.method}`)
        }
      } catch (e) {
        console.error('Error while parsing WalletConnect session request', e)
        onError(extractErrorMsg(e))
      }
    },
    [addresses, onError, walletConnectClient]
  )

  useEffect(() => {
    walletConnectClient?.on('session_request', onSessionRequest)

    return () => {
      walletConnectClient?.removeListener('session_request', onSessionRequest)
    }
  }, [onSessionRequest, walletConnectClient])

  useEffect(() => {
    const _window = window as unknown as AlephiumWindow
    _window.electron?.walletConnect.onSetDeepLinkUri((deepLinkUri) => {
      setDeepLinkUri(deepLinkUri)
    })
  }, [])

  return (
    <WalletConnectContext.Provider
      value={{
        requestEvent,
        walletConnectClient,
        dappTxData,
        setDappTxData,
        onError,
        deepLinkUri
      }}
    >
      {children}
      <ModalPortal>
        {isDeployContractSendModalOpen && (
          <SendModalDeployContract onClose={() => setIsDeployContractSendModalOpen(false)} />
        )}
        {isCallScriptSendModalOpen && <SendModalScript onClose={() => setIsCallScriptSendModalOpen(false)} />}
      </ModalPortal>
    </WalletConnectContext.Provider>
  )
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
