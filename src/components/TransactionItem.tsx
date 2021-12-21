import { Input, Output } from 'alephium-js/dist/api/api-explorer'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import _ from 'lodash'
import { FC } from 'react'
import styled, { css } from 'styled-components'

import { deviceBreakPoints } from '../style/globalStyles'
import { openInWebBrowser } from '../utils/misc'
import Address from './Address'
import AmountBadge from './Badge'

dayjs.extend(relativeTime)

interface TransactionItemProps {
  pending?: boolean
  txUrl: string
  address: string
  inputs?: Input[]
  outputs?: Output[]
  timestamp: number
  amount: string | bigint
}

const TransactionItem: FC<TransactionItemProps> = ({
  txUrl,
  pending = false, // Transaction that has been sent and waiting to be fetched
  address,
  amount,
  inputs,
  outputs,
  timestamp
}) => {
  const amountIsBigInt = typeof amount === 'bigint'
  const isOut = (amountIsBigInt && amount < 0) || pending

  return (
    <TransactionItemContainer onClick={() => openInWebBrowser(txUrl)} pending={pending}>
      <TxDetails>
        <DirectionLabel>{isOut ? '↑ TO' : '↓ FROM'}</DirectionLabel>
        <AddressListContainer>
          {pending ? (
            <Address key={address} hash={address || ''} />
          ) : (
            <IOList currentAddress={address} isOut={isOut} outputs={outputs} inputs={inputs} timestamp={timestamp} />
          )}
        </AddressListContainer>
        <TxTimestamp>{dayjs(timestamp).format('MM/DD/YYYY HH:mm:ss')}</TxTimestamp>
      </TxDetails>
      <TxAmountContainer>
        <AmountBadge
          type={isOut ? 'minus' : 'plus'}
          prefix={isOut ? '- ' : '+ '}
          content={amountIsBigInt && amount < 0 ? (amount * -1n).toString() : amount.toString()}
          amount
        />
      </TxAmountContainer>
    </TransactionItemContainer>
  )
}

const TransactionItemContainer = styled.div<{ pending: boolean }>`
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-1);
  cursor: pointer;
  transition: all 0.1s ease-out;

  &:hover {
    background-color: ${({ theme }) => theme.bg.hover};
  }

  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};

  @media ${deviceBreakPoints.mobile} {
    padding: var(--spacing-3) 0;
  }

  ${({ pending }) =>
    pending &&
    css`
      opacity: 0.5;

      background: linear-gradient(90deg, rgba(200, 200, 200, 0.4), rgba(200, 200, 200, 0.05));
      background-size: 400% 400%;
      animation: gradient 2s ease infinite;

      @keyframes gradient {
        0% {
          background-position: 0% 50%;
        }
        25% {
          background-position: 100% 50%;
        }
        75% {
          background-position: 25% 50%;
        }
        100% {
          background-position: 0% 50%;
        }
      }
    `}
`

const IOList = ({
  currentAddress,
  isOut,
  outputs,
  inputs,
  timestamp
}: {
  currentAddress: string
  isOut: boolean
  outputs?: Output[]
  inputs?: Input[]
  timestamp: number
}) => {
  const io = (isOut ? outputs : inputs) as Array<Output | Input> | undefined
  const genesisTimestamp = 1231006505000

  if (io && io.length > 0) {
    return io.every((o) => o.address === currentAddress) ? (
      <Address key={currentAddress} hash={currentAddress} />
    ) : (
      <>
        {_(io.filter((o) => o.address !== currentAddress))
          .map((v) => v.address)
          .uniq()
          .value()
          .map((v) => (
            <Address key={v} hash={v || ''} />
          ))}
      </>
    )
  } else if (timestamp === genesisTimestamp) {
    return <TXSpecialTypeLabel>Genesis TX</TXSpecialTypeLabel>
  } else {
    return <TXSpecialTypeLabel>Mining Rewards</TXSpecialTypeLabel>
  }
}

const TXSpecialTypeLabel = styled.span`
  align-self: flex-start;
  color: ${({ theme }) => theme.font.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 3px 6px;
  margin: 3px 0;
  border-radius: var(--radius-small);
  font-style: italic;
`

const TxDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  line-height: 16px;
`

const DirectionLabel = styled.span`
  font-size: 0.9em;
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: var(--spacing-1);
`

const AddressListContainer = styled.div`
  display: flex;
  margin-bottom: var(--spacing-1);
`

const TxAmountContainer = styled.div`
  flex: 0.5;
  display: flex;
  justify-content: flex-end;
`

const TxTimestamp = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 0.9em;
`

export default TransactionItem
