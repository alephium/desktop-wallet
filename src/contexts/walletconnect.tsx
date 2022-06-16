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

import SignClient from '@walletconnect/sign-client'
import { SignDeployContractTxParams, SignExecuteScriptTxParams, SignTransferTxParams } from 'alephium-web3'
import { createContext, FC, useCallback, useContext, useEffect, useState } from 'react'

import { useAddressesContext } from '../contexts/addresses'
import {
  DappTxData,
  DeployContractTxData,
  ScriptTxData,
  TransferTxData,
  TxDataToModalType,
  TxType
} from '../types/transactions'
import { extractErrorMsg } from '../utils/misc'
import { useSendModalContext } from './sendModal'

interface WalletConnectContextProps {
  walletConnectClient?: SignClient
  sessionTopic?: string
  setSessionTopic: (topic?: string) => void
  dappTxData?: DappTxData
  setDappTxData: (data?: DappTxData) => void
  // TODO: Specify type when @walletconnect has specified it. Untyped as of beta.101
  requestEvent?: any
  onError: (error: string) => void
}

function noop() {
  // do nothing.
}

const initialContext: WalletConnectContextProps = {
  walletConnectClient: undefined,
  sessionTopic: undefined,
  setSessionTopic: () => null,
  dappTxData: undefined,
  setDappTxData: () => null,
  requestEvent: undefined,
  onError: () => null
}

const WalletConnectContext = createContext<WalletConnectContextProps>(initialContext)

export const WalletConnectContextProvider: FC = ({ children }) => {
  const { openSendModal } = useSendModalContext()
  const { addresses } = useAddressesContext()
  const [walletConnectClient, setWalletConnectClient] = useState<SignClient>()
  const [dappTxData, setDappTxData] = useState<DappTxData>()
  // TODO: Specify type when @walletconnect specifies it. Untyped as of beta.101
  const [requestEvent, setRequestEvent] = useState<any>()
  const [sessionTopic, setSessionTopic] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!walletConnectClient) initializeWalletConnectClient()
  }, [walletConnectClient])

  const initializeWalletConnectClient = async () => {
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
  }

  const setTxDataAndOpenModal = useCallback(
    ({ txData, modalType }: TxDataToModalType) => {
      setDappTxData(txData)
      openSendModal(modalType)
    },
    [openSendModal, setDappTxData]
  )

  const getAddressByHash = useCallback(
    (signerAddress: string) => {
      const address = addresses.find((a) => a.hash === signerAddress)
      if (!address) throw new Error(`Unknown signer address: ${signerAddress}`)

      return address
    },
    [addresses]
  )

  const onError = useCallback(
    (error: string): void => {
      if (walletConnectClient && requestEvent) {
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
      }
    },
    [walletConnectClient, requestEvent]
  )

  const onSessionRequest = useCallback(
    // TODO: Specify type on event when @walletconnect specifies it. Untyped as of beta.101
    async (event: any) => {
      setRequestEvent(event)

      const {
        params: {
          request: { method, params }
        }
      } = event

      try {
        if (method === 'alph_signTransferTx') {
          const p = params as SignTransferTxParams
          const txData: TransferTxData = {
            fromAddress: getAddressByHash(p.signerAddress),
            toAddress: p.destinations[0].address,
            alphAmount: p.destinations[0].alphAmount,
            gasAmount: p.gasAmount,
            gasPrice: p.gasPrice
          }

          setTxDataAndOpenModal({ txData, modalType: TxType.TRANSFER })
        } else if (method === 'alph_signContractCreationTx') {
          const p = params as SignDeployContractTxParams
          const txData: DeployContractTxData = {
            fromAddress: getAddressByHash(p.signerAddress),
            bytecode: p.bytecode,
            initialAlphAmount: p.initialAlphAmount,
            issueTokenAmount: p.issueTokenAmount,
            gasAmount: p.gasAmount,
            gasPrice: p.gasPrice
          }

          setTxDataAndOpenModal({ txData, modalType: TxType.DEPLOY_CONTRACT })
        } else if (method === 'alph_signScriptTx') {
          const p = params as SignExecuteScriptTxParams
          const txData: ScriptTxData = {
            fromAddress: getAddressByHash(p.signerAddress),
            bytecode: p.bytecode,
            alphAmount: p.alphAmount,
            gasAmount: p.gasAmount,
            gasPrice: p.gasPrice
          }

          setTxDataAndOpenModal({ txData, modalType: TxType.SCRIPT })
        } else {
          throw new Error(`Unsupported walletconnect request: ${method}`)
        }
      } catch (e) {
        console.error('Error while parsing WalletConnect session request', e)
        onError(extractErrorMsg(e))
      }
    },
    [getAddressByHash, onError, setTxDataAndOpenModal]
  )

  useEffect(() => {
    walletConnectClient?.on('session_request', onSessionRequest)

    return () => {
      walletConnectClient?.removeListener('session_request', onSessionRequest)
    }
  }, [onSessionRequest, walletConnectClient])

  return (
    <WalletConnectContext.Provider
      value={{
        requestEvent,
        walletConnectClient,
        dappTxData,
        setDappTxData,
        sessionTopic,
        setSessionTopic,
        onError
      }}
    >
      {children}
    </WalletConnectContext.Provider>
  )
}

export const useWalletConnectContext = () => useContext(WalletConnectContext)
