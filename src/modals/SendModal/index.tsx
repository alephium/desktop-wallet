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
import { useWalletConnectContext } from '../../contexts/walletconnect'
import { ReactComponent as PaperPlaneDarkSVG } from '../../images/paper-plane-dark.svg'
import { ReactComponent as PaperPlaneLightSVG } from '../../images/paper-plane-light.svg'
import { isAmountWithinRange } from '../../utils/transactions'
import CenteredModal from '../CenteredModal'
import ConsolidateUTXOsModal from '../ConsolidateUTXOsModal'
import SendModalCheckTransaction from './CheckTransaction'
import SendModalTransactionForm from './TransactionForm'

enum StepIndex {
  Send = 1,
  InfoCheck = 2,
  PasswordCheck = 3
}

const stepToTitle = new Map<StepIndex, string>([
  [StepIndex.Send, 'Send'],
  [StepIndex.InfoCheck, 'Review'],
  [StepIndex.PasswordCheck, 'Password Check']
])

export type SendTransactionData = {
  fromAddress: Address
  toAddress: string
  amount: string
  gasAmount?: string
  gasPrice?: string
  script?: string
  contractCode?: string
  contractState?: string
  issueTokenAmount?: string
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
  const { dappTransactionData, requestEvent, walletConnect } = useWalletConnectContext()
  const [title, setTitle] = useState('')
  const [transactionData, setTransactionData] = useState<SendTransactionData | undefined>(dappTransactionData)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<StepIndex>(StepIndex.Send)
  const [isConsolidateUTXOsModalVisible, setIsConsolidateUTXOsModalVisible] = useState(false)
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState('')
  const [contractAddress, setContractAddress] = useState('')
  const [fees, setFees] = useState<bigint>()
  const theme = useTheme()

  useEffect(() => {
    setTitle(stepToTitle.get(step) || 'Unknown')
  }, [setStep, setTitle, step])

  const confirmPassword = () => {
    if (consolidationRequired) setIsConsolidateUTXOsModalVisible(false)
    setStep(StepIndex.PasswordCheck)
  }

  const buildTransaction = async (transactionData: SendTransactionData) => {
    const { fromAddress, toAddress, gasAmount, gasPrice, contractCode, contractState, issueTokenAmount, script } =
      transactionData
    let { amount } = transactionData

    const isContractTx = contractCode !== ''
    const isScriptTx = script !== ''

    if (isContractTx) {
      if (transactionData.amount == '') {
        amount = '0.000001'
      }
    }
    if (isScriptTx) {
      if (transactionData.amount == '') {
        amount = '0'
      }
    }

    setTransactionData({
      ...transactionData,
      amount
    })

    const amountInSet = convertAlphToSet(amount)
    const isDataComplete =
      fromAddress &&
      (isContractTx || isScriptTx || toAddress) &&
      (isScriptTx || isAmountWithinRange(amountInSet, fromAddress.availableBalance))

    if (wallet && client && isDataComplete) {
      setIsLoading(true)

      const sweep = amountInSet === fromAddress.availableBalance
      setIsSweeping(sweep)

      try {
        if (sweep) {
          const { unsignedTxs, fees } = await client.buildSweepTransactions(fromAddress, toAddress)
          setSweepUnsignedTxs(unsignedTxs)
          setFees(fees)
        } else if (isContractTx) {
          const compileResult = await client.clique.contracts.postContractsCompileContract({ code: contractCode ?? '' })
          const buildResult = await client.clique.contracts.postContractsUnsignedTxBuildContract({
            fromPublicKey: fromAddress.publicKey,
            bytecode: compileResult.data.bytecode,
            initialFields: JSON.parse(contractState || ''),
            alphAmount: amountInSet.toString(),
            issueTokenAmount: issueTokenAmount || undefined,
            gas: gasAmount ? parseInt(gasAmount) : undefined,
            gasPrice: gasPrice ? convertAlphToSet(gasPrice).toString() : undefined
          })
          setContractAddress(buildResult.data.contractAddress)
          setUnsignedTransaction(buildResult.data.unsignedTx)
          setUnsignedTxId(buildResult.data.txId)
          setFees(BigInt(gasAmount ?? 0) * BigInt(convertAlphToSet(gasPrice ?? '0')))
        } else if (isScriptTx) {
          const compileResult = await client.clique.contracts.postContractsCompileScript({ code: script ?? '' })
          const buildResult = await client.clique.contracts.postContractsUnsignedTxBuildScript({
            fromPublicKey: fromAddress.publicKey,
            bytecode: compileResult.data.bytecode,
            alphAmount: amountInSet.toString(),
            gas: gasAmount ? parseInt(gasAmount) : undefined,
            gasPrice: gasPrice ? convertAlphToSet(gasPrice).toString() : undefined
          })
          setUnsignedTransaction(buildResult.data.unsignedTx)
          setUnsignedTxId(buildResult.data.txId)
          setFees(BigInt(gasAmount ?? 0) * BigInt(convertAlphToSet(gasPrice ?? '0')))
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
          setStep(StepIndex.InfoCheck)
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

    const { fromAddress, toAddress, amount, contractCode, script } = transactionData
    const isContractTx = contractCode !== ''
    const isScriptTx = script !== ''

    if ((isContractTx || isScriptTx || toAddress) && fromAddress) {
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
        } else if (isContractTx) {
          const { txId } = await client.signAndSendContractOrScript(
            fromAddress,
            unsignedTxId,
            unsignedTransaction,
            currentNetwork
          )

          if (walletConnect !== undefined) {
            await walletConnect.respond({
              topic: requestEvent?.topic ?? '',
              response: {
                id: requestEvent?.request.id ?? 0,
                jsonrpc: '2.0',
                result: {
                  txId,
                  contractAddress
                }
              }
            })
          }

          setAddress(fromAddress)
        } else if (isScriptTx) {
          const { txId } = await client.signAndSendContractOrScript(
            fromAddress,
            unsignedTxId,
            unsignedTransaction,
            currentNetwork
          )

          if (walletConnect !== undefined) {
            await walletConnect.respond({
              topic: requestEvent?.topic ?? '',
              response: {
                id: requestEvent?.request.id ?? 0,
                jsonrpc: '2.0',
                result: {
                  txId
                }
              }
            })
          }

          setAddress(fromAddress)
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
    <CenteredModal title={title} onClose={onClose} isLoading={isLoading} header={modalHeader}>
      {step === StepIndex.Send && (
        <SendModalTransactionForm data={transactionData} onSubmit={buildTransaction} onCancel={onClose} />
      )}
      {step === StepIndex.InfoCheck && transactionData && fees !== undefined && (
        <SendModalCheckTransaction
          data={transactionData}
          fees={fees}
          onSend={passwordRequirement ? confirmPassword : handleSend}
          onCancel={() => setStep(StepIndex.Send)}
        />
      )}
      {step === StepIndex.PasswordCheck && passwordRequirement && (
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
