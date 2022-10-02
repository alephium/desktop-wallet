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

import { APIError, getHumanReadableError } from '@alephium/sdk'
import { SweepAddressTransaction } from '@alephium/sdk/api/alephium'
import { SignResult } from '@alephium/web3'
import { AnimatePresence } from 'framer-motion'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { useTheme } from 'styled-components'

import PasswordConfirmation from '../../components/PasswordConfirmation'
import { Address, useAddressesContext } from '../../contexts/addresses'
import { Client, TxModalType, useGlobalContext } from '../../contexts/global'
import { useWalletConnectContext } from '../../contexts/walletconnect'
import { ReactComponent as PaperPlaneDarkSVG } from '../../images/paper-plane-dark.svg'
import { ReactComponent as PaperPlaneLightSVG } from '../../images/paper-plane-light.svg'
import { extractErrorMsg } from '../../utils/misc'
import { NetworkName } from '../../utils/settings'
import CenteredModal from '../CenteredModal'
import ConsolidateUTXOsModal from '../ConsolidateUTXOsModal'
import { Step, stepToTitle } from '.'
import DeployContractTxModal from './DeployContractTxModal'
import ScriptTxModal from './ScriptTxModal'
import TransferTxModal from './TransferTxModal'

type ReactSet<T> = Dispatch<SetStateAction<T>>

export type UnsignedTx = {
  fromGroup: number
  toGroup: number
  unsignedTx: string
}

export type TxContext = {
  setIsSweeping: ReactSet<boolean>
  sweepUnsignedTxs: SweepAddressTransaction[]
  setSweepUnsignedTxs: ReactSet<SweepAddressTransaction[]>
  setFees: ReactSet<bigint | undefined>
  unsignedTransaction: UnsignedTx | undefined
  setUnsignedTransaction: ReactSet<UnsignedTx | undefined>
  unsignedTxId: string
  setUnsignedTxId: ReactSet<string>
  isSweeping: boolean
  consolidationRequired: boolean
  currentNetwork: NetworkName
  setAddress: (address: Address) => void
}

export type TxModalProps = {
  txModalType: TxModalType
  onClose: () => void
}

export type TxModalFactoryProps<PT extends { fromAddress: Address }, T extends PT> = {
  buildTitle: string
  initialTxData: PT
  onClose: () => void
  BuildTx: (props: { data: PT; onSubmit: (data: T) => void; onCancel: () => void }) => JSX.Element
  CheckTx: (props: { data: T; fees: bigint; onSend: () => void; onCancel: () => void }) => JSX.Element
  buildTransaction: (client: Client, data: T, context: TxContext) => Promise<void>
  handleSend: (client: Client, data: T, context: TxContext) => Promise<string | undefined>
  getWalletConnectResult: (context: TxContext, signature: string) => SignResult
}

export function TxModalFactory<PT extends { fromAddress: Address }, T extends PT>({
  buildTitle,
  initialTxData,
  onClose,
  BuildTx,
  CheckTx,
  buildTransaction,
  handleSend,
  getWalletConnectResult
}: TxModalFactoryProps<PT, T>) {
  const {
    currentNetwork,
    client,
    wallet,
    settings: {
      general: { passwordRequirement }
    },
    setSnackbarMessage
  } = useGlobalContext()
  const [title, setTitle] = useState(buildTitle)
  const [transactionData, setTransactionData] = useState<T | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<Step>('send')
  const [isConsolidateUTXOsModalVisible, setIsConsolidateUTXOsModalVisible] = useState(false)
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const [fees, setFees] = useState<bigint>()
  const theme = useTheme()
  const { requestEvent, walletConnect, onError } = useWalletConnectContext()

  const { setAddress } = useAddressesContext()
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState<UnsignedTx>()

  const getTxContext = (): TxContext => ({
    setIsSweeping: setIsSweeping,
    sweepUnsignedTxs: sweepUnsignedTxs,
    setSweepUnsignedTxs: setSweepUnsignedTxs,
    setFees: setFees,
    unsignedTransaction: unsignedTransaction,
    setUnsignedTransaction: setUnsignedTransaction,
    unsignedTxId: unsignedTxId,
    setUnsignedTxId: setUnsignedTxId,
    isSweeping: isSweeping,
    consolidationRequired: consolidationRequired,
    currentNetwork: currentNetwork,
    setAddress: setAddress
  })

  useEffect(() => {
    if (step !== 'send') {
      setTitle(stepToTitle[step])
    } else {
      setTitle(buildTitle)
    }
  }, [setStep, setTitle, step, buildTitle])

  const confirmPassword = () => {
    if (consolidationRequired) setIsConsolidateUTXOsModalVisible(false)
    setStep('password-check')
  }

  useEffect(() => {
    if (!consolidationRequired || !transactionData || !client) return

    const buildConsolidationTransactions = async () => {
      setIsSweeping(true)

      setIsLoading(true)
      const { fromAddress } = transactionData
      const { unsignedTxs, fees } = await client.buildSweepTransactions(fromAddress, fromAddress.hash)
      setSweepUnsignedTxs(unsignedTxs)
      setFees(fees)
      setIsLoading(false)
    }

    buildConsolidationTransactions()
  }, [client, consolidationRequired, transactionData])

  const modalHeader = theme.name === 'dark' ? <PaperPlaneDarkSVG width="315px" /> : <PaperPlaneLightSVG width="315px" />
  const buildTransactionExtended = async (data: T) => {
    setTransactionData(data)
    if (wallet && client) {
      setIsLoading(true)
      try {
        await buildTransaction(client, data, getTxContext())
        if (!isConsolidateUTXOsModalVisible) {
          setStep('info-check')
        }
      } catch (e) {
        // TODO: When API error codes are available, replace this substring check with a proper error code check
        const { error } = e as APIError
        if (error?.detail && (error.detail.includes('consolidating') || error.detail.includes('consolidate'))) {
          setIsConsolidateUTXOsModalVisible(true)
          setConsolidationRequired(true)
        } else {
          setSnackbarMessage({
            text: getHumanReadableError(e, 'Error while building the transaction'),
            type: 'alert',
            duration: 5000
          })
        }
      }
      setIsLoading(false)
    }
  }

  const handleSendExtended = async () => {
    if (client && transactionData) {
      setIsLoading(true)
      try {
        const txContext = getTxContext()
        const signature = await handleSend(client, transactionData, txContext)

        if (signature && requestEvent && walletConnect) {
          const wcResult = getWalletConnectResult(txContext, signature)
          await walletConnect.respond({
            topic: requestEvent.topic,
            response: {
              id: requestEvent.id,
              jsonrpc: '2.0',
              result: wcResult
            }
          })
        }

        setAddress(transactionData.fromAddress)
        setSnackbarMessage({
          text: isSweeping && sweepUnsignedTxs.length > 1 ? 'Transactions sent!' : 'Transaction sent!',
          type: 'success'
        })
        onClose()
      } catch (e) {
        console.error(e)
        const error = extractErrorMsg(e)
        setSnackbarMessage({
          text: getHumanReadableError(e, `Error while sending the transaction: ${error}`),
          type: 'alert',
          duration: 5000
        })
        onError(error)
      }
      setIsLoading(false)
    }
  }
  return (
    <CenteredModal title={title} onClose={onClose} isLoading={isLoading} header={modalHeader}>
      {step === 'send' && (
        <BuildTx data={transactionData ?? initialTxData} onSubmit={buildTransactionExtended} onCancel={onClose} />
      )}
      {step === 'info-check' && transactionData && fees && (
        <CheckTx
          data={transactionData}
          fees={fees}
          onSend={passwordRequirement ? confirmPassword : handleSendExtended}
          onCancel={() => setStep('send')}
        />
      )}
      {step === 'password-check' && passwordRequirement && (
        <PasswordConfirmation
          text="Enter your password to send the transaction."
          buttonText="Send"
          onCorrectPasswordEntered={handleSendExtended}
        />
      )}
      <AnimatePresence>
        {isConsolidateUTXOsModalVisible && (
          <ConsolidateUTXOsModal
            onClose={() => setIsConsolidateUTXOsModalVisible(false)}
            onConsolidateClick={passwordRequirement ? confirmPassword : handleSendExtended}
            fee={fees}
          />
        )}
      </AnimatePresence>
    </CenteredModal>
  )
}

export const TxModal = ({ txModalType, onClose }: TxModalProps) => {
  const { mainAddress } = useAddressesContext()
  const { dappTransactionData } = useWalletConnectContext()

  let txData
  if (typeof dappTransactionData === 'undefined') {
    if (typeof mainAddress === 'undefined') {
      return null
    } else {
      txData = { fromAddress: mainAddress }
    }
  } else {
    txData = dappTransactionData[1]
  }

  return (
    <>
      {txModalType === 'transfer' && <TransferTxModal initialTxData={txData} onClose={onClose} />}
      {txModalType === 'deploy-contract' && <DeployContractTxModal initialTxData={txData} onClose={onClose} />}
      {txModalType === 'script' && <ScriptTxModal initialTxData={txData} onClose={onClose} />}
    </>
  )
}

export default TxModal
