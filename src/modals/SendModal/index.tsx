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

import { APIError, convertAlphToSet, getHumanReadableError } from '@alephium/sdk'
import { SweepAddressTransaction } from '@alephium/sdk/api/alephium'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTheme } from 'styled-components'

import PasswordConfirmation from '../../components/PasswordConfirmation'
import { Address, useAddressesContext } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import { ReactComponent as PaperPlaneDarkSVG } from '../../images/paper-plane-dark.svg'
import { ReactComponent as PaperPlaneLightSVG } from '../../images/paper-plane-light.svg'
import { isAmountWithinRange } from '../../utils/transactions'
import CenteredModal from '../CenteredModal'
import ConsolidateUTXOsModal from '../ConsolidateUTXOsModal'
import SendModalCheckTransaction from './CheckTransaction'
import SendModalTransactionForm from './TransactionForm'

type StepIndex = 1 | 2 | 3

export type SendTransactionData = {
  fromAddress: Address
  toAddress: string
  amount: string
  gasAmount?: string
  gasPrice?: string
}

interface SendModalProps {
  onClose: () => void
}

const SendModal = ({ onClose }: SendModalProps) => {
  const {
    client,
    wallet,
    setSnackbarMessage,
    settings: {
      general: { passwordRequirement }
    },
    currentNetwork
  } = useGlobalContext()
  const { setAddress } = useAddressesContext()
  const [title, setTitle] = useState('')
  const [transactionData, setTransactionData] = useState<SendTransactionData | undefined>()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<StepIndex>(1)
  const [isConsolidateUTXOsModalVisible, setIsConsolidateUTXOsModalVisible] = useState(false)
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState('')
  const [fees, setFees] = useState<bigint>()
  const theme = useTheme()

  useEffect(() => {
    if (step === 1) {
      setTitle('Send')
    } else if (step === 2) {
      setTitle('Info Check')
    } else if (step === 3) {
      setTitle('Password Check')
    }
  }, [setStep, setTitle, step])

  const confirmPassword = () => {
    if (consolidationRequired) setIsConsolidateUTXOsModalVisible(false)
    setStep(3)
  }

  const buildTransaction = async (transactionData: SendTransactionData) => {
    setTransactionData(transactionData)

    const { fromAddress, toAddress, amount, gasAmount, gasPrice } = transactionData
    const amountInSet = convertAlphToSet(amount)
    const isDataComplete = fromAddress && toAddress && isAmountWithinRange(amountInSet, fromAddress.availableBalance)

    if (wallet && client && isDataComplete) {
      setIsLoading(true)

      const sweep = amountInSet === fromAddress.availableBalance
      setIsSweeping(sweep)

      try {
        if (sweep) {
          const { unsignedTxs, fees } = await client.buildSweepTransactions(fromAddress, toAddress)
          setSweepUnsignedTxs(unsignedTxs)
          setFees(fees)
        } else {
          const { data } = await client.clique.transactionCreate(
            fromAddress.hash,
            fromAddress.publicKey,
            toAddress,
            amountInSet.toString(),
            undefined,
            gasAmount ? parseInt(gasAmount) : undefined,
            gasPrice ? convertAlphToSet(gasPrice).toString() : undefined
          )
          setUnsignedTransaction(data.unsignedTx)
          setUnsignedTxId(data.txId)
          setFees(BigInt(data.gasAmount) * BigInt(data.gasPrice))
        }
        if (!isConsolidateUTXOsModalVisible) {
          setStep(2)
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

  const handleSend = async () => {
    if (!transactionData || !client) return

    const { fromAddress, toAddress, amount } = transactionData

    if (toAddress && fromAddress) {
      setIsLoading(true)

      try {
        if (isSweeping) {
          const sendToAddress = consolidationRequired ? fromAddress.hash : toAddress
          const transactionType = consolidationRequired ? 'consolidation' : 'sweep'

          for (const { txId, unsignedTx } of sweepUnsignedTxs) {
            const data = await client.signAndSendTransaction(
              fromAddress,
              txId,
              unsignedTx,
              sendToAddress,
              transactionType,
              currentNetwork
            )

            if (data) {
              setAddress(fromAddress)
            }
          }
        } else {
          const data = await client.signAndSendTransaction(
            fromAddress,
            unsignedTxId,
            unsignedTransaction,
            toAddress,
            'transfer',
            currentNetwork,
            convertAlphToSet(amount)
          )

          if (data) {
            setAddress(fromAddress)
          }
        }

        setSnackbarMessage({
          text: isSweeping && sweepUnsignedTxs.length > 1 ? 'Transactions sent!' : 'Transaction sent!',
          type: 'success'
        })
        onClose()
      } catch (e) {
        console.error(e)
        setSnackbarMessage({
          text: getHumanReadableError(e, 'Error while sending the transaction'),
          type: 'alert',
          duration: 5000
        })
      }

      setIsLoading(false)
    }
  }

  const modalHeader = theme.name === 'dark' ? <PaperPlaneDarkSVG width="315px" /> : <PaperPlaneLightSVG width="315px" />

  return (
    <CenteredModal title={title} onClose={onClose} isLoading={isLoading} header={modalHeader} narrow={step === 3}>
      {step === 1 && <SendModalTransactionForm data={transactionData} onSubmit={buildTransaction} onCancel={onClose} />}
      {step === 2 && transactionData && fees && (
        <SendModalCheckTransaction
          data={transactionData}
          fees={fees}
          onSend={passwordRequirement ? confirmPassword : handleSend}
          onCancel={() => setStep(1)}
        />
      )}
      {step === 3 && passwordRequirement && (
        <PasswordConfirmation
          text="Enter your password to send the transaction."
          buttonText="Send"
          onCorrectPasswordEntered={handleSend}
        />
      )}
      <AnimatePresence>
        {isConsolidateUTXOsModalVisible && (
          <ConsolidateUTXOsModal
            onClose={() => setIsConsolidateUTXOsModalVisible(false)}
            onConsolidateClick={passwordRequirement ? confirmPassword : handleSend}
            fee={fees}
          />
        )}
      </AnimatePresence>
    </CenteredModal>
  )
}

export default SendModal
