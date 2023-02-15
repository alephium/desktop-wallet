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
import { useTheme } from 'styled-components'

import { buildSweepTransactions } from '@/api/transactions'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useGlobalContext } from '@/contexts/global'
import { useWalletConnectContext } from '@/contexts/walletconnect'
import { useAppSelector } from '@/hooks/redux'
import { ReactComponent as PaperPlaneDarkSVG } from '@/images/paper-plane-dark.svg'
import { ReactComponent as PaperPlaneLightSVG } from '@/images/paper-plane-light.svg'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import ConsolidateUTXOsModal from '@/modals/ConsolidateUTXOsModal'
import ModalPortal from '@/modals/ModalPortal'
import { Address } from '@/types/addresses'
import { TxContext, UnsignedTx } from '@/types/transactions'
import { extractErrorMsg } from '@/utils/misc'

type Step = 'build-tx' | 'info-check' | 'password-check'

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
  const { requestEvent, walletConnectClient, onError, setDappTxData } = useWalletConnectContext()
  const settings = useAppSelector((s) => s.settings)
  const { setSnackbarMessage } = useGlobalContext()

  const [modalTitle, setModalTitle] = useState(title)
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

  const theme = useTheme()
  const modalHeader = theme.name === 'dark' ? <PaperPlaneDarkSVG width="315px" /> : <PaperPlaneLightSVG width="315px" />

  useEffect(() => {
    if (step === 'info-check') {
      setModalTitle(t`Review`)
    } else if (step === 'password-check') {
      setModalTitle(t`Password Check`)
    } else if (step === 'build-tx') {
      setModalTitle(title)
    }
  }, [step, t, title])

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
        setSnackbarMessage({
          text: getHumanReadableError(e, t`Error while building the transaction`),
          type: 'alert',
          duration: 5000
        })
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

      setSnackbarMessage({
        text: isSweeping && sweepUnsignedTxs.length > 1 ? t`Transactions sent!` : t`Transaction sent!`,
        type: 'success'
      })
      onCloseExtended()
    } catch (e) {
      console.error(e)

      const error = extractErrorMsg(e)
      setSnackbarMessage({
        text: getHumanReadableError(e, `${t('Error while sending the transaction')}: ${error}`),
        type: 'alert',
        duration: 5000
      })
      onError(error)
    }

    setIsLoading(false)
  }

  const confirmPassword = () => {
    if (consolidationRequired) setIsConsolidateUTXOsModalVisible(false)
    setStep('password-check')
  }

  return (
    <CenteredModal title={modalTitle} onClose={onCloseExtended} isLoading={isLoading} header={modalHeader} key={step}>
      {step === 'build-tx' && (
        <BuildTxModalContent
          data={transactionData ?? initialTxData}
          onSubmit={buildTransactionExtended}
          onCancel={onCloseExtended}
        />
      )}
      {step === 'info-check' && !!transactionData && !!fees && (
        <>
          <CheckTxModalContent data={transactionData} fees={fees} />
          <ModalFooterButtons>
            <ModalFooterButton secondary onClick={() => setStep('build-tx')}>
              {t`Back`}
            </ModalFooterButton>
            <ModalFooterButton onClick={settings.passwordRequirement ? confirmPassword : handleSendExtended}>
              {t`Send`}
            </ModalFooterButton>
          </ModalFooterButtons>
        </>
      )}
      {step === 'password-check' && settings.passwordRequirement && (
        <PasswordConfirmation
          text={t`Enter your password to send the transaction.`}
          buttonText={t`Send`}
          onCorrectPasswordEntered={handleSendExtended}
        />
      )}
      <ModalPortal>
        {isConsolidateUTXOsModalVisible && (
          <ConsolidateUTXOsModal
            onClose={() => setIsConsolidateUTXOsModalVisible(false)}
            onConsolidateClick={settings.passwordRequirement ? confirmPassword : handleSendExtended}
            fee={fees}
          />
        )}
      </ModalPortal>
    </CenteredModal>
  )
}

export default SendModal
