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

import { addApostrophes, calAmountDelta } from '@alephium/sdk'
import { Transaction } from '@alephium/sdk/dist/api/api-explorer'
import dayjs from 'dayjs'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '../components/ActionLink'
import AddressBadge from '../components/AddressBadge'
import AddressEllipsed from '../components/AddressEllipsed'
import Amount from '../components/Amount'
import Badge from '../components/Badge'
import ExpandableSection from '../components/ExpandableSection'
import IOList from '../components/IOList'
import Tooltip from '../components/Tooltip'
import { Address } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import useAddressLinkHandler from '../hooks/useAddressLinkHandler'
import { openInWebBrowser } from '../utils/misc'
import { ModalHeader } from './CenteredModal'
import SideModal from './SideModal'

interface TransactionDetailsModalProps {
  transaction: Transaction
  address: Address
  onClose: () => void
}

interface DetailsRowProps {
  label: string
  className?: string
}

const TransactionDetailsModal = ({ transaction, address, onClose }: TransactionDetailsModalProps) => {
  const { t } = useTranslation('App')
  const {
    settings: {
      network: { explorerUrl }
    }
  } = useGlobalContext()
  const theme = useTheme()
  const handleShowAddress = useAddressLinkHandler()

  let amount = calAmountDelta(transaction, address.hash)
  const isOutgoingTx = amount < 0
  amount = isOutgoingTx ? amount * -1n : amount

  const handleShowTxInExplorer = () => {
    openInWebBrowser(`${explorerUrl}/#/transactions/${transaction.hash}`)
  }
  return (
    <SideModal onClose={onClose} label={t`Transaction details`}>
      <Header contrast>
        <AmountWrapper tabIndex={0} color={isOutgoingTx ? theme.font.secondary : theme.global.valid}>
          <span>{isOutgoingTx ? '-' : '+'}</span>{' '}
          <Amount value={amount} fadeDecimals color={isOutgoingTx ? theme.font.secondary : theme.global.valid} />
        </AmountWrapper>
        <HeaderInfo>
          <Direction>{isOutgoingTx ? '↑ ' + t`Sent` : '↓ ' + t`Received`}</Direction>
          <FromIn>{isOutgoingTx ? t`from` : t`in`}</FromIn>
          <AddressBadge address={address} truncate withBorders />
        </HeaderInfo>
        <ActionLink onClick={handleShowTxInExplorer}>↗ {t`Show in explorer`}</ActionLink>
      </Header>
      <Details role="table">
        <DetailsRow label={t`From`}>
          {isOutgoingTx ? (
            <AddressList>
              <ActionLinkStyled onClick={() => handleShowAddress(address.hash)} key={address.hash}>
                <AddressBadge address={address} truncate showHashWhenNoLabel withBorders />
              </ActionLinkStyled>
            </AddressList>
          ) : (
            <IOList
              currentAddress={address.hash}
              isOut={isOutgoingTx}
              outputs={transaction.outputs}
              inputs={transaction.inputs}
              timestamp={transaction.timestamp}
              linkToExplorer
            />
          )}
        </DetailsRow>
        <DetailsRow label={t`To`}>
          {!isOutgoingTx ? (
            <AddressList>
              <ActionLinkStyled onClick={() => handleShowAddress(address.hash)} key={address.hash}>
                <AddressBadge address={address} showHashWhenNoLabel withBorders />
              </ActionLinkStyled>
            </AddressList>
          ) : (
            <IOList
              currentAddress={address.hash}
              isOut={isOutgoingTx}
              outputs={transaction.outputs}
              inputs={transaction.inputs}
              timestamp={transaction.timestamp}
              linkToExplorer
            />
          )}
        </DetailsRow>
        <DetailsRow label={t`Status`}>
          <Badge color={theme.global.valid} border>
            <span tabIndex={0}>{t`Confirmed`}</span>
          </Badge>
        </DetailsRow>
        <DetailsRow label={t`Timestamp`}>
          <span tabIndex={0}>{dayjs(transaction.timestamp).format('YYYY-MM-DD [at] HH:mm:ss [UTC]Z')}</span>
        </DetailsRow>
        <DetailsRow label={t`Fee`}>
          {<Amount tabIndex={0} value={BigInt(transaction.gasAmount) * BigInt(transaction.gasPrice)} fadeDecimals />}
        </DetailsRow>
        <DetailsRow label={t`Total value`}>
          <Amount tabIndex={0} value={amount} fadeDecimals fullPrecision />
        </DetailsRow>
        <ExpandableSectionStyled sectionTitleClosed={t`Click to see more`} sectionTitleOpen={t`Click to see less`}>
          <DetailsRow label={t`Gas amount`}>
            <span tabIndex={0}>{addApostrophes(transaction.gasAmount.toString())}</span>
          </DetailsRow>
          <DetailsRow label={t`Gas price`}>
            <Amount tabIndex={0} value={BigInt(transaction.gasPrice)} fadeDecimals fullPrecision />
          </DetailsRow>
          <DetailsRow label={t`Inputs`}>
            <AddressList>
              {transaction.inputs?.map((input) => (
                <ActionLinkStyled key={`${input.outputRef.key}`} onClick={() => handleShowAddress(input.address)}>
                  <AddressEllipsed key={`${input.outputRef.key}`} addressHash={input.address} />
                </ActionLinkStyled>
              ))}
            </AddressList>
          </DetailsRow>
          <DetailsRow label={t`Outputs`}>
            <AddressList>
              {transaction.outputs?.map((output) => (
                <ActionLinkStyled key={`${output.key}`} onClick={() => handleShowAddress(output.address)}>
                  <AddressEllipsed key={`${output.key}`} addressHash={output.address} />
                </ActionLinkStyled>
              ))}
            </AddressList>
          </DetailsRow>
        </ExpandableSectionStyled>
      </Details>
      <Tooltip />
    </SideModal>
  )
}

export default TransactionDetailsModal

let DetailsRow: FC<DetailsRowProps> = ({ children, label, className }) => (
  <div className={className} role="row">
    <DetailsRowLabel tabIndex={0} role="cell">
      {label}
    </DetailsRowLabel>
    {children}
  </div>
)

DetailsRow = styled(DetailsRow)`
  padding: 12px var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  justify-content: space-between;
  min-height: 52px;

  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const Direction = styled.span`
  flex-shrink: 0;
`

const AmountWrapper = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 26px;
  font-weight: var(--fontWeight-semiBold);
`

const Header = styled(ModalHeader)`
  padding: 35px;
  display: flex;
  align-items: center;
  flex-direction: column;
`

const HeaderInfo = styled.div`
  display: flex;
  gap: 8px;
  font-weight: var(--fontWeight-semiBold);
  align-items: center;
  margin-top: var(--spacing-3);
  margin-bottom: var(--spacing-5);
  max-width: 100%;
`

const FromIn = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const Details = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
`

const DetailsRowLabel = styled.div`
  font-weight: var(--fontWeight-medium);
`

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 28px;
`

const AddressList = styled.div`
  overflow: hidden;
`

const ActionLinkStyled = styled(ActionLink)`
  width: 100%;
  justify-content: right;
`
