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

import WalletConnectClient, { CLIENT_EVENTS } from '@walletconnect/client'
import { SessionTypes } from '@walletconnect/types'
import { createContext, Dispatch, FC, SetStateAction, useContext, useEffect, useState } from 'react'

import { useAddressesContext } from '../contexts/addresses'
import { SendTransactionData } from '../modals/SendModal'
import { useGlobalContext } from './global'

export interface ContextType {
  isWalletConnectModalOpen: boolean
  setIsWalletConnectModalOpen: (isOpen: boolean) => void
  walletConnect?: WalletConnectClient
  setWalletConnect: Dispatch<SetStateAction<WalletConnectClient | undefined>>
  dappTransactionData?: SendTransactionData
  requestEvent?: SessionTypes.RequestEvent
}

export const initialContext: ContextType = {
  isWalletConnectModalOpen: false,
  setIsWalletConnectModalOpen: () => undefined,
  walletConnect: undefined,
  setWalletConnect: () => undefined,
  dappTransactionData: undefined,
  requestEvent: undefined
}

export const Context = createContext<ContextType>(initialContext)

export const WalletConnectContextProvider: FC = ({ children }) => {
  const { setIsSendModalOpen, settings } = useGlobalContext()
  const { addresses } = useAddressesContext()
  const [isWalletConnectModalOpen, setIsWalletConnectModalOpen] = useState(false)
  const [walletConnect, setWalletConnect] = useState<WalletConnectClient>()
  const [dappTransactionData, setDappTransactionData] = useState<SendTransactionData>()
  const [requestEvent, setRequestEvent] = useState<SessionTypes.RequestEvent>()

  useEffect(() => {
    if (walletConnect === undefined) {
      WalletConnectClient.init({
        controller: true,

        // TODO: add as an advanced settings option "WalletConnect Project Id"
        projectId: '6e2562e43678dd68a9070a62b6d52207',
        relayUrl: 'wss://relay.walletconnect.com',
        metadata: {
          name: 'Alephium Wallet',
          description: 'Alephium Wallet',
          url: 'https://github.com/alephium/desktop-wallet/releases',
          icons: ['https://alephium.org/favicon-32x32.png']
        }
      })
        .then((client) => {
          setWalletConnect(client)
        })
        .catch((e) => {
          console.log('WalletConnect error')
          console.log(e)
        })
      return
    }

    const onSessionRequest = async (event: SessionTypes.RequestEvent) => {
      const {
        topic,
        request: { id, method, params }
      } = event
      setRequestEvent(event)

      if (method === 'alephium_getServices') {
        await walletConnect.respond({
          topic,
          response: {
            id,
            jsonrpc: '2.0',
            result: settings.network
          }
        })
      } else if (method === 'alephium_signTx') {
        const fromAddress = addresses.find((a) => a.hash === params.fromAddress)

        if (fromAddress === undefined) {
          await walletConnect.respond({
            topic,
            response: {
              id,
              jsonrpc: '2.0',
              error: {
                code: -32000,
                message: 'Wallet is locked or invalid address specified.'
              }
            }
          })
        } else {
          const txData = {
            fromAddress,
            toAddress: '',
            amount: '',
            gasAmount: params.gas,
            script: params.script,
            contractCode: params?.contract?.trim(),
            contractState: params.state && JSON.stringify(params.state),
            issueTokenAmount: params.issueTokenAmount
          }
          setDappTransactionData(txData)
          setIsSendModalOpen(true)
        }
      } else {
        console.warn('Unknown request given')
      }
    }

    walletConnect.on(CLIENT_EVENTS.session.request, onSessionRequest)
    return () => {
      walletConnect.removeListener(CLIENT_EVENTS.session.request, onSessionRequest)
    }
  }, [walletConnect, addresses, setIsSendModalOpen, settings])

  return (
    <Context.Provider
      value={{
        requestEvent,
        isWalletConnectModalOpen,
        setIsWalletConnectModalOpen,
        walletConnect,
        setWalletConnect,
        dappTransactionData
      }}
    >
      {children}
    </Context.Provider>
  )
}

export const useWalletConnectContext = () => useContext(Context)
