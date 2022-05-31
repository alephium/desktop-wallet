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

import { TxType } from '../types/transactions'

interface SendModalContextProps {
  txType?: TxType
  isSendModalOpen: boolean
  openSendModal: (type: TxType) => void
  closeSendModal: () => void
}

const initialContext: SendModalContextProps = {
  txType: undefined,
  isSendModalOpen: false,
  openSendModal: () => null,
  closeSendModal: () => null
}

const SendModalContext = createContext<SendModalContextProps>(initialContext)

export const SendModalContextProvider: FC = ({ children }) => {
  const [isSendModalOpen, setIsSendModalOpen] = useState(initialContext.isSendModalOpen)
  const [txType, setTxType] = useState<TxType>()

  const openSendModal = (type: TxType) => {
    setIsSendModalOpen(true)
    setTxType(type)
  }

  const closeSendModal = () => {
    setIsSendModalOpen(false)
    setTxType(undefined)
  }

  return (
    <SendModalContext.Provider
      value={{
        txType,
        isSendModalOpen,
        openSendModal,
        closeSendModal
      }}
    >
      {children}
    </SendModalContext.Provider>
  )
}

export const useSendModalContext = () => useContext(SendModalContext)
