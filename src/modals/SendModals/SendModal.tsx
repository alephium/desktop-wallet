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
import { SignResult } from 'alephium-web3'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTheme } from 'styled-components'

import PasswordConfirmation from '../../components/PasswordConfirmation'
import { Address, useAddressesContext } from '../../contexts/addresses'
import { Client, useGlobalContext } from '../../contexts/global'
import { useWalletConnectContext } from '../../contexts/walletconnect'
import { ReactComponent as PaperPlaneDarkSVG } from '../../images/paper-plane-dark.svg'
import { ReactComponent as PaperPlaneLightSVG } from '../../images/paper-plane-light.svg'
import { extractErrorMsg } from '../../utils/misc'
import { NetworkName } from '../../utils/settings'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '../CenteredModal'
import ConsolidateUTXOsModal from '../ConsolidateUTXOsModal'

type Step = 'build-tx' | 'info-check' | 'password-check'

type UnsignedTx = {
  fromGroup: number
  toGroup: number
  unsignedTx: string
}

export type TxContext = {
  setIsSweeping: (isSweeping: boolean) => void
  sweepUnsignedTxs: SweepAddressTransaction[]
  setSweepUnsignedTxs: (txs: SweepAddressTransaction[]) => void
  setFees: (fees: bigint | undefined) => void
  unsignedTransaction: UnsignedTx | undefined
  setUnsignedTransaction: (tx: UnsignedTx | undefined) => void
  unsignedTxId: string
  setUnsignedTxId: (txId: string) => void
  isSweeping: boolean
  consolidationRequired: boolean
  currentNetwork: NetworkName
  setAddress: (address: Address) => void
}

type SendModalProps<PT extends { fromAddress: Address }, T extends PT> = {
  title: string
  initialTxData: PT
  onClose: () => void
  BuildTxModalContent: (props: { data: PT; onSubmit: (data: T) => void; onCancel: () => void }) => JSX.Element
  CheckTxModalContent: (props: { data: T; fees: bigint }) => JSX.Element
  buildTransaction: (client: Client, data: T, context: TxContext) => Promise<void>
  handleSend: (client: Client, data: T, context: TxContext) => Promise<string | undefined>
  getWalletConnectResult: (context: TxContext, signature: string) => SignResult
}

function SendModal<PT extends { fromAddress: Address }, T extends PT>({
  title,
  initialTxData,
  onClose,
  BuildTxModalContent,
  CheckTxModalContent,
  buildTransaction,
  handleSend,
  getWalletConnectResult
}: SendModalProps<PT, T>) {
  const {
    currentNetwork,
    client,
    wallet,
    settings: {
      general: { passwordRequirement }
    },
    setSnackbarMessage
  } = useGlobalContext()
  const [modalTitle, setModalTitle] = useState(title)
  const [transactionData, setTransactionData] = useState<T | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<Step>('build-tx')
  const [isConsolidateUTXOsModalVisible, setIsConsolidateUTXOsModalVisible] = useState(false)
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const [fees, setFees] = useState<bigint>()
  const theme = useTheme()
  const { requestEvent, walletConnectClient, onError, setDappTxData } = useWalletConnectContext()

  const { setAddress } = useAddressesContext()
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState<UnsignedTx>()

  const txContext: TxContext = {
    setIsSweeping,
    sweepUnsignedTxs,
    setSweepUnsignedTxs,
    setFees,
    unsignedTransaction,
    setUnsignedTransaction,
    unsignedTxId,
    setUnsignedTxId,
    isSweeping,
    consolidationRequired,
    currentNetwork,
    setAddress
  }

  useEffect(() => {
    if (step === 'info-check') {
      setModalTitle('Review')
    } else if (step === 'password-check') {
      setModalTitle('Password Check')
    } else if (step === 'build-tx') {
      setModalTitle(title)
    }
  }, [step, title])

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
        await buildTransaction(client, data, txContext)
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
        const signature = await handleSend(client, transactionData, txContext)

        if (signature && requestEvent && walletConnectClient) {
          const wcResult = getWalletConnectResult(txContext, signature)
          await walletConnectClient.respond({
            topic: requestEvent.topic,
            response: {
              id: requestEvent.request.id,
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
        onCloseExtended()
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

  const onCloseExtended = () => {
    setDappTxData(undefined)
    onClose()
  }

  return (
    <CenteredModal title={modalTitle} onClose={onCloseExtended} isLoading={isLoading} header={modalHeader}>
      {step === 'build-tx' && (
        <BuildTxModalContent
          data={transactionData ?? initialTxData}
          onSubmit={buildTransactionExtended}
          onCancel={onCloseExtended}
        />
      )}
      {step === 'info-check' && transactionData && fees && (
        <>
          <CheckTxModalContent data={transactionData} fees={fees} />
          <ModalFooterButtons>
            <ModalFooterButton secondary onClick={() => setStep('build-tx')}>
              Back
            </ModalFooterButton>
            <ModalFooterButton onClick={passwordRequirement ? confirmPassword : handleSendExtended}>
              Send
            </ModalFooterButton>
          </ModalFooterButtons>
        </>
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

export default SendModal
