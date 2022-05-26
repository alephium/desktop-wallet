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

import { createContext, FC, useContext, useState } from 'react'

export enum SendTxModalType {
  TRANSFER,
  DEPLOY_CONTRACT,
  SCRIPT
}

interface SendTransactionModalContextProps {
  sendTxModalType?: SendTxModalType
  isSendTxModalOpen: boolean
  openSendTxModal: (type: SendTxModalType) => void
  closeSendTxModal: () => void
}

const initialContext: SendTransactionModalContextProps = {
  sendTxModalType: undefined,
  isSendTxModalOpen: false,
  openSendTxModal: () => null,
  closeSendTxModal: () => null
}

const SendTransactionModalContext = createContext<SendTransactionModalContextProps>(initialContext)

export const SendTransactionModalContextProvider: FC = ({ children }) => {
  const [isSendTxModalOpen, setIsSendTxModalOpen] = useState(initialContext.isSendTxModalOpen)
  const [sendTxModalType, setSendTxModalType] = useState<SendTxModalType>()

  const openSendTxModal = (type: SendTxModalType) => {
    setIsSendTxModalOpen(true)
    setSendTxModalType(type)
  }

  const closeSendTxModal = () => {
    setIsSendTxModalOpen(false)
    setSendTxModalType(undefined)
  }

  return (
    <SendTransactionModalContext.Provider
      value={{
        sendTxModalType,
        isSendTxModalOpen,
        openSendTxModal,
        closeSendTxModal
      }}
    >
      {children}
    </SendTransactionModalContext.Provider>
  )
}

export const useSendTransactionModalContext = () => useContext(SendTransactionModalContext)
