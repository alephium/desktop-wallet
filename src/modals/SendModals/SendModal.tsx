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
import { node } from '@alephium/web3'
import { colord } from 'colord'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PostHog, usePostHog } from 'posthog-js/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import { buildSweepTransactions } from '@/api/transactions'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ScrollableModalContent } from '@/modals/CenteredModal'
import ConsolidateUTXOsModal from '@/modals/ConsolidateUTXOsModal'
import ModalPortal from '@/modals/ModalPortal'
import StepsProgress, { Step } from '@/modals/SendModals/StepsProgress'
import {
  transactionBuildFailed,
  transactionSendFailed,
  transactionsSendSucceeded
} from '@/storage/transactions/transactionsActions'
import { Address } from '@/types/addresses'
import { CheckTxProps, TxContext, UnsignedTx } from '@/types/transactions'

export type ConfigurableSendModalProps<PT extends { fromAddress: Address }, T extends PT> = {
  txData?: T
  initialTxData: PT
  initialStep?: Step
  onClose: () => void
  onTransactionBuildFail?: (errorMessage: string) => void
  onSendSuccess?: (result: node.SignResult) => Promise<void>
  onSendFail?: (errorMessage: string) => Promise<void>
}

export interface SendModalProps<PT extends { fromAddress: Address }, T extends PT>
  extends ConfigurableSendModalProps<PT, T> {
  title: string
  AddressesTxModalContent: (props: {
    data: PT
    onSubmit: (data: PT) => void
    onCancel: () => void
  }) => JSX.Element | null
  BuildTxModalContent: (props: { data: PT; onSubmit: (data: T) => void; onCancel: () => void }) => JSX.Element | null
  CheckTxModalContent: (props: CheckTxProps<T>) => JSX.Element | null
  buildTransaction: (data: T, context: TxContext) => Promise<void>
  handleSend: (data: T, context: TxContext, posthog: PostHog) => Promise<string | undefined>
  getWalletConnectResult: (context: TxContext, signature: string) => node.SignResult
  isContract?: boolean
}

function SendModal<PT extends { fromAddress: Address }, T extends PT>({
  title,
  initialTxData,
  onClose,
  AddressesTxModalContent,
  BuildTxModalContent,
  CheckTxModalContent,
  buildTransaction,
  handleSend,
  getWalletConnectResult,
  txData,
  initialStep,
  isContract,
  onTransactionBuildFail,
  onSendSuccess,
  onSendFail
}: SendModalProps<PT, T>) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const settings = useAppSelector((s) => s.settings)
  const posthog = usePostHog()

  const [addressesData, setAddressesData] = useState<PT>(txData ?? initialTxData)
  const [transactionData, setTransactionData] = useState<T | undefined>(txData)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<Step>('addresses')
  const [isConsolidateUTXOsModalVisible, setIsConsolidateUTXOsModalVisible] = useState(false)
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<node.SweepAddressTransaction[]>([])
  const [fees, setFees] = useState<bigint>()
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState<UnsignedTx>()
  const [isTransactionBuildTriggered, setIsTransactionBuildTriggered] = useState(false)

  const isRequestToApproveContractCall = initialStep === 'info-check'

  useEffect(() => {
    if (!consolidationRequired || !transactionData) return

    const buildConsolidationTransactions = async () => {
      setIsSweeping(true)
      setIsLoading(true)

      const { fromAddress } = transactionData
      const { unsignedTxs, fees } = await buildSweepTransactions(fromAddress, fromAddress.hash)

      setSweepUnsignedTxs(unsignedTxs)
      setFees(fees)
      setIsLoading(false)
    }

    buildConsolidationTransactions()
  }, [consolidationRequired, transactionData])

  const txContext: TxContext = useMemo(
    () => ({
      setIsSweeping,
      sweepUnsignedTxs,
      setSweepUnsignedTxs,
      setFees,
      unsignedTransaction,
      setUnsignedTransaction,
      unsignedTxId,
      setUnsignedTxId,
      isSweeping,
      consolidationRequired
    }),
    [consolidationRequired, isSweeping, sweepUnsignedTxs, unsignedTransaction, unsignedTxId]
  )

  const buildTransactionExtended = useCallback(
    async (data: T) => {
      setTransactionData(data)
      setIsLoading(true)

      try {
        await buildTransaction(data, txContext)

        if (!isConsolidateUTXOsModalVisible) {
          setStep('info-check')
        }
      } catch (e) {
        // TODO: When API error codes are available, replace this substring check with a proper error code check
        const error = (e as unknown as string).toString()

        if (error.includes('consolidating') || error.includes('consolidate')) {
          setIsConsolidateUTXOsModalVisible(true)
          setConsolidationRequired(true)
          posthog.capture('Error', { message: 'Could not build tx, consolidation required' })
        } else {
          const errorMessage = getHumanReadableError(e, t('Error while building transaction'))

          if (error.includes('NotEnoughApprovedBalance')) {
            dispatch(transactionBuildFailed('Your address does not have enough balance for this transaction'))
          } else {
            dispatch(transactionBuildFailed(errorMessage))
            posthog.capture('Error', { message: 'Could not build tx' })
          }

          if (isRequestToApproveContractCall && onTransactionBuildFail) {
            onTransactionBuildFail(errorMessage)
          } else {
            onClose()
          }
        }
      }

      setIsLoading(false)
    },
    [
      buildTransaction,
      dispatch,
      isConsolidateUTXOsModalVisible,
      isRequestToApproveContractCall,
      onClose,
      onTransactionBuildFail,
      posthog,
      t,
      txContext
    ]
  )

  useEffect(() => {
    if (isRequestToApproveContractCall && !isTransactionBuildTriggered && transactionData) {
      setIsTransactionBuildTriggered(true)
      buildTransactionExtended(transactionData)
    }
  }, [buildTransactionExtended, isRequestToApproveContractCall, isTransactionBuildTriggered, transactionData])

  const handleSendExtended = async () => {
    if (!transactionData) return

    setIsLoading(true)

    try {
      const signature = await handleSend(transactionData, txContext, posthog)

      if (signature && onSendSuccess) {
        const result = getWalletConnectResult(txContext, signature)
        await onSendSuccess(result)
      }

      dispatch(transactionsSendSucceeded({ nbOfTransactionsSent: isSweeping ? sweepUnsignedTxs.length : 1 }))
      setStep('tx-sent')
    } catch (e) {
      dispatch(transactionSendFailed(getHumanReadableError(e, t('Error while sending the transaction'))))
      posthog.capture('Error', { message: 'Could not send tx' })

      onSendFail && onSendFail(getHumanReadableError(e, 'Error while sending the transaction'))
    } finally {
      setIsLoading(false)
    }
  }

  const moveToSecondStep = (data: PT) => {
    setAddressesData(data)
    setStep('build-tx')
  }

  useEffect(() => {
    if (step === 'tx-sent') setTimeout(onClose, 2000)
  }, [onClose, step])

  const confirmPassword = () => {
    if (consolidationRequired) setIsConsolidateUTXOsModalVisible(false)
    setStep('password-check')
  }

  const onBackCallback = {
    addresses: undefined,
    'build-tx': () => setStep('addresses'),
    'info-check': () => setStep('build-tx'),
    'password-check': () => setStep('info-check'),
    'tx-sent': undefined
  }[step]

  return (
    <CenteredModal
      title={title}
      onClose={onClose}
      isLoading={isLoading}
      dynamicContent
      onBack={onBackCallback}
      focusMode
      noPadding
      disableBack={isRequestToApproveContractCall && step !== 'password-check'}
    >
      <StepsProgress currentStep={step} isContract={isContract} />
      {step === 'addresses' && (
        <AddressesTxModalContent data={addressesData} onSubmit={moveToSecondStep} onCancel={onClose} />
      )}
      {step === 'build-tx' && (
        <ScrollableModalContent>
          <BuildTxModalContent
            data={{
              ...(transactionData ?? {}),
              ...addressesData
            }}
            onSubmit={buildTransactionExtended}
            onCancel={onClose}
          />
        </ScrollableModalContent>
      )}
      {step === 'info-check' && !!transactionData && !!fees && (
        <ScrollableModalContent>
          <CheckTxModalContent
            data={transactionData}
            fees={fees}
            onSubmit={settings.passwordRequirement ? confirmPassword : handleSendExtended}
          />
        </ScrollableModalContent>
      )}
      {step === 'password-check' && settings.passwordRequirement && (
        <ScrollableModalContent>
          <PasswordConfirmation
            text={t('Enter your password to send the transaction.')}
            buttonText={t('Send')}
            highlightButton
            onCorrectPasswordEntered={handleSendExtended}
          >
            <PasswordConfirmationNote>
              {t('You can disable this confirmation step from the wallet settings.')}
            </PasswordConfirmationNote>
          </PasswordConfirmation>
        </ScrollableModalContent>
      )}
      {step === 'tx-sent' && (
        <ScrollableModalContent>
          <ConfirmationCheckContainer>
            <ConfirmationAnimation {...fadeIn}>
              <CheckIcon size={80} strokeWidth={1} />
            </ConfirmationAnimation>
          </ConfirmationCheckContainer>
        </ScrollableModalContent>
      )}
      <ModalPortal>
        {isConsolidateUTXOsModalVisible && (
          <ScrollableModalContent>
            <ConsolidateUTXOsModal
              onClose={() => setIsConsolidateUTXOsModalVisible(false)}
              onConsolidateClick={settings.passwordRequirement ? confirmPassword : handleSendExtended}
              fee={fees}
            />
          </ScrollableModalContent>
        )}
      </ModalPortal>
    </CenteredModal>
  )
}

export default SendModal

const PasswordConfirmationNote = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
`

const ConfirmationCheckContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`

const ConfirmationAnimation = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  width: 150px;
  background-color: ${({ theme }) => colord(theme.global.valid).alpha(0.1).toHex()};
  border: 1px solid ${({ theme }) => colord(theme.global.valid).alpha(0.1).toHex()};
  border-radius: var(--radius-full);
`

const CheckIcon = styled(Check)`
  color: ${({ theme }) => theme.global.valid};
`
