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
import { SignUnsignedTxResult, transactionSign } from '@alephium/web3'
import { getSdkError } from '@walletconnect/utils'
import { usePostHog } from 'posthog-js/react'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import client from '@/api/client'
import FooterButton from '@/components/Buttons/FooterButton'
import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import { useWalletConnectContext } from '@/contexts/walletconnect'
import { useAppDispatch } from '@/hooks/redux'
import CenteredModal, { ModalContent } from '@/modals/CenteredModal'
import { unsignedTransactionSignSucceeded } from '@/storage/transactions/transactionsActions'
import { SignUnsignedTxData } from '@/types/transactions'
import { WALLETCONNECT_ERRORS } from '@/utils/constants'

interface SignUnsignedTxModalProps {
  onClose: () => void
  txData: SignUnsignedTxData
}

const SignUnsignedTxModal = ({ onClose, txData }: SignUnsignedTxModalProps) => {
  const { t } = useTranslation()
  const { requestEvent, onSessionRequestError, onSessionRequestSuccess } = useWalletConnectContext()
  const posthog = usePostHog()
  const dispatch = useAppDispatch()
  const [isLoading, setIsLoading] = useState(false)
  const [decodedUnsignedTx, setDecodedUnsignedTx] = useState<Omit<SignUnsignedTxResult, 'signature'> | undefined>(
    undefined
  )

  useEffect(() => {
    const decodeUnsignedTx = async () => {
      setIsLoading(true)
      const decodedResult = await client.node.transactions.postTransactionsDecodeUnsignedTx({
        unsignedTx: txData.unsignedTx
      })

      setDecodedUnsignedTx({
        txId: decodedResult.unsignedTx.txId,
        fromGroup: decodedResult.fromGroup,
        toGroup: decodedResult.toGroup,
        unsignedTx: txData.unsignedTx,
        gasAmount: decodedResult.unsignedTx.gasAmount,
        gasPrice: BigInt(decodedResult.unsignedTx.gasPrice)
      })

      setIsLoading(false)
    }

    decodeUnsignedTx()
  }, [txData.unsignedTx])

  const handleSign = async () => {
    if (!decodedUnsignedTx || !requestEvent) return

    try {
      const signature = transactionSign(decodedUnsignedTx.unsignedTx, txData.fromAddress.privateKey)
      const signResult: SignUnsignedTxResult = { signature, ...decodedUnsignedTx }
      await onSessionRequestSuccess(requestEvent, signResult)
      dispatch(unsignedTransactionSignSucceeded)
    } catch (e) {
      posthog.capture('Error', { message: 'Could not sign unsigned tx' })

      if (requestEvent) {
        onSessionRequestError(requestEvent, {
          message: getHumanReadableError(e, 'Error while signing unsigned tx'),
          code: WALLETCONNECT_ERRORS.TRANSACTION_SIGN_FAILED
        })
      }
    }
  }

  const onCloseExtended = useCallback(() => {
    onClose()

    if (requestEvent) onSessionRequestError(requestEvent, getSdkError('USER_REJECTED_EVENTS'))
  }, [onClose, requestEvent, onSessionRequestError])

  return (
    <CenteredModal
      title={'Sign Unsigned Transaction'}
      onClose={onCloseExtended}
      isLoading={isLoading}
      dynamicContent
      focusMode
      noPadding
    >
      {decodedUnsignedTx && (
        <ModalContent>
          <InputFieldsColumn>
            <InfoBox label={'Transaction Id'} text={decodedUnsignedTx.txId} wordBreak />
            <InfoBox label={'Unsigned Transaction'} text={decodedUnsignedTx.unsignedTx} wordBreak />
          </InputFieldsColumn>
          <FooterButton onClick={() => handleSign()} disabled={isLoading || !decodedUnsignedTx}>
            {t('Sign')}
          </FooterButton>
        </ModalContent>
      )}
    </CenteredModal>
  )
}

export default SignUnsignedTxModal
