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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { buildSweepTransactions } from '@/api/transactions'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useWalletConnectContext } from '@/contexts/walletconnect'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ScrollableModalContent } from '@/modals/CenteredModal'
import ConsolidateUTXOsModal from '@/modals/ConsolidateUTXOsModal'
import ModalPortal from '@/modals/ModalPortal'
import FooterButton from '@/modals/SendModals/FooterButton'
import StepsProgress, { Step } from '@/modals/SendModals/StepsProgress'
import { transactionBuildFailed, transactionSendFailed, transactionsSendSucceeded } from '@/storage/app-state/actions'
import { Address } from '@/types/addresses'
import { TxContext, UnsignedTx } from '@/types/transactions'
import { extractErrorMsg } from '@/utils/misc'

type SendModalProps<PT extends { fromAddress: Address }, T extends PT> = {
  title: string
  initialTxData: PT
  onClose: () => void
  BuildTxModalContent: (props: { data: PT; onSubmit: (data: T) => void; onCancel: () => void }) => JSX.Element | null
  CheckTxModalContent: (props: { data: T; fees: bigint }) => JSX.Element | null
  buildTransaction: (data: T, context: TxContext) => Promise<void>
  handleSend: (data: T, context: TxContext) => Promise<string | undefined>
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
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { requestEvent, walletConnectClient, onError, setDappTxData } = useWalletConnectContext()
  const settings = useAppSelector((s) => s.settings)

  const [transactionData, setTransactionData] = useState<T | undefined>()
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
    consolidationRequired
  }

  const buildTransactionExtended = async (data: T) => {
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
  }

  const onCloseExtended = () => {
    setDappTxData(undefined)
    onClose()
  }

  const handleSendExtended = async () => {
    if (!transactionData) return

    setIsLoading(true)

    try {
      const signature = await handleSend(transactionData, txContext)

      if (signature && requestEvent && walletConnectClient) {
        const wcResult = getWalletConnectResult(txContext, signature)

        await walletConnectClient.respond({
          topic: requestEvent.topic,
          response: {
            id: requestEvent.id,
            jsonrpc: '2.0',
            result: wcResult
          }
        })
      }

      dispatch(transactionsSendSucceeded({ nbOfTransactionsSent: isSweeping ? sweepUnsignedTxs.length : 1 }))
      onCloseExtended()
    } catch (e) {
      dispatch(transactionSendFailed(getHumanReadableError(e, t('Error while sending the transaction'))))
      onError(extractErrorMsg(e))
    }

    setIsLoading(false)
  }

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
          <CheckTxModalContent data={transactionData} fees={fees} />
          <FooterButton
            onClick={settings.passwordRequirement ? confirmPassword : handleSendExtended}
            variant={settings.passwordRequirement ? 'default' : 'valid'}
          >
            {t(settings.passwordRequirement ? 'Confirm' : 'Send')}
          </FooterButton>
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
