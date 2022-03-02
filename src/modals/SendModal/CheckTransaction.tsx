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

import { convertAlphToSet, formatAmountForDisplay } from 'alephium-js'
import styled from 'styled-components'

import InfoBox from '../../components/InfoBox'
import { ModalFooterButton, ModalFooterButtons } from '../CenteredModal'
import { SendTransactionData } from '.'

interface SendModalCheckTransactionProps {
  data: SendTransactionData
  fees: bigint
  onSend: () => void
  onCancel: () => void
}

const SendModalCheckTransaction = ({ data, fees, onSend, onCancel }: SendModalCheckTransactionProps) => {
  const isSendButtonActive = data.toAddress.length > 0 && data.amount.length > 0
  const amountInSet = convertAlphToSet(data.amount)
  const amountIncludingFees = amountInSet + fees
  const exceededBy = amountIncludingFees - data.fromAddress.availableBalance
  const expectedAmount = exceededBy > 0 ? data.fromAddress.availableBalance - exceededBy : amountInSet

  return (
    <>
      <ModalContent>
        <InfoBox text={data.fromAddress.hash} label="From address" wordBreak />
        <InfoBox text={data.toAddress} label="To address" wordBreak />
        <InfoBox text={`${formatAmountForDisplay(expectedAmount, false, 7)} ℵ`} label="Amount" />
        {fees && <InfoBox text={`${formatAmountForDisplay(fees, false, 7)} ℵ`} label="Expected fee" />}
      </ModalContent>
      <ModalFooterButtons>
        <ModalFooterButton secondary onClick={onCancel}>
          Cancel
        </ModalFooterButton>
        <ModalFooterButton onClick={onSend} disabled={!isSendButtonActive}>
          Send
        </ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
`

export default SendModalCheckTransaction
