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
import { SignResult, SweepAddressTransaction } from '@alephium/sdk/api/alephium'
import { getSdkError } from '@walletconnect/utils'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { PostHog, usePostHog } from 'posthog-js/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import { buildSweepTransactions } from '@/api/transactions'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useWalletConnectContext } from '@/contexts/walletconnect'
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
import { WALLETCONNECT_ERRORS } from '@/utils/constants'

type SendModalProps<PT extends { fromAddress: Address }, T extends PT> = {
  title: string
  initialTxData: PT
  onClose: () => void
  BuildTxModalContent: (props: { data: PT; onSubmit: (data: T) => void; onCancel: () => void }) => JSX.Element | null
  CheckTxModalContent: (props: CheckTxProps<T>) => JSX.Element | null
  buildTransaction: (data: T, context: TxContext) => Promise<void>
  handleSend: (data: T, context: TxContext, posthog?: PostHog) => Promise<string | undefined>
  getWalletConnectResult: (context: TxContext, signature: string) => SignResult
  txData?: T
  initialStep?: Step
}

function SendModal<PT extends { fromAddress: Address }, T extends PT>({
  title,
  initialTxData,
  onClose,
  BuildTxModalContent,
  CheckTxModalContent,
  buildTransaction,
  handleSend,
  getWalletConnectResult,
  txData,
  initialStep
}: SendModalProps<PT, T>) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { requestEvent, walletConnectClient, onSessionRequestError, onSessionRequestSuccess } =
    useWalletConnectContext()
  const settings = useAppSelector((s) => s.settings)
  const posthog = usePostHog()

  const [transactionData, setTransactionData] = useState<T | undefined>(txData)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<Step>('build-tx')
  const [isConsolidateUTXOsModalVisible, setIsConsolidateUTXOsModalVisible] = useState(false)
  const [consolidationRequired, setConsolidationRequired] = useState(false)
  const [isSweeping, setIsSweeping] = useState(false)
  const [sweepUnsignedTxs, setSweepUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const [fees, setFees] = useState<bigint>()
  const [unsignedTxId, setUnsignedTxId] = useState('')
  const [unsignedTransaction, setUnsignedTransaction] = useState<UnsignedTx>()

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
        const { error } = e as APIError
        if (error?.detail && (error.detail.includes('consolidating') || error.detail.includes('consolidate'))) {
          setIsConsolidateUTXOsModalVisible(true)
          setConsolidationRequired(true)
        } else {
          dispatch(transactionBuildFailed(getHumanReadableError(e, t('Error while building transaction'))))
        }
      }

      setIsLoading(false)
    },
    [buildTransaction, dispatch, isConsolidateUTXOsModalVisible, t, txContext]
  )

  useEffect(() => {
    if (initialStep === 'info-check' && transactionData) {
      buildTransactionExtended(transactionData)
    }
  }, [buildTransactionExtended, initialStep, transactionData])

  const onCloseExtended = useCallback(() => {
    onClose()

    if (requestEvent) onSessionRequestError(requestEvent, getSdkError('USER_REJECTED_EVENTS'))
  }, [onClose, requestEvent, onSessionRequestError])

  const handleSendExtended = async () => {
    if (!transactionData) return

    setIsLoading(true)

    try {
      const signature = await handleSend(transactionData, txContext, posthog)

      if (walletConnectClient && requestEvent && signature) {
        const result = getWalletConnectResult(txContext, signature)
        await onSessionRequestSuccess(requestEvent, result)
      }

      dispatch(transactionsSendSucceeded({ nbOfTransactionsSent: isSweeping ? sweepUnsignedTxs.length : 1 }))
      setStep('tx-sent')
    } catch (e) {
      dispatch(transactionSendFailed(getHumanReadableError(e, t('Error while sending the transaction'))))

      if (requestEvent)
        onSessionRequestError(requestEvent, {
          message: getHumanReadableError(e, 'Error while sending the transaction'),
          code: WALLETCONNECT_ERRORS.TRANSACTION_SEND_FAILED
        })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (step === 'tx-sent') setTimeout(onCloseExtended, 2000)
  }, [onCloseExtended, step])

  const confirmPassword = () => {
    if (consolidationRequired) setIsConsolidateUTXOsModalVisible(false)
    setStep('password-check')
  }

  const onBackCallback = {
    'build-tx': undefined,
    'info-check': () => setStep('build-tx'),
    'password-check': () => setStep('info-check'),
    'tx-sent': undefined
  }[step]

  return (
    <CenteredModal
      title={title}
      onClose={onCloseExtended}
      isLoading={isLoading}
      dynamicContent
      header={<StepsProgress currentStep={step} />}
      onBack={onBackCallback}
      focusMode
    >
      {step === 'build-tx' && (
        <ScrollableModalContent>
          <BuildTxModalContent
            data={transactionData ?? initialTxData}
            onSubmit={buildTransactionExtended}
            onCancel={onCloseExtended}
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
          <ConfirmationAnimation {...fadeIn}>
            <CheckIcon size={130} />
          </ConfirmationAnimation>
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

const ConfirmationAnimation = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`

const CheckIcon = styled(Check)`
  color: ${({ theme }) => theme.global.valid};
`
