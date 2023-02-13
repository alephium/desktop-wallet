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

import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Table, { TableCellPlaceholder, TableRow } from '@/components/Table'
import TransactionalInfo from '@/components/TransactionalInfo'
import { useAppSelector } from '@/hooks/redux'
import { selectAddressIds } from '@/store/addressesSlice'
import { selectAddressesConfirmedTransactions } from '@/store/confirmedTransactionsSlice'
import { selectAddressesPendingTransactions } from '@/store/pendingTransactionsSlice'
import { AddressHash } from '@/types/addresses'
import { AddressConfirmedTransaction } from '@/types/transactions'

interface OverviewPageTransactionListProps {
  onTransactionClick: (transaction: AddressConfirmedTransaction) => void
  limit?: number
  className?: string
}

const OverviewPageTransactionList = ({ className, onTransactionClick, limit }: OverviewPageTransactionListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const addresses = useAppSelector(selectAddressIds) as AddressHash[]
  const [allConfirmedTxs, allPendingTxs, isLoading] = useAppSelector((s) => [
    selectAddressesConfirmedTransactions(s, addresses),
    selectAddressesPendingTransactions(s, addresses),
    s.addresses.loading
  ])

  const showSkeletonLoading = isLoading && !allConfirmedTxs.length && !allPendingTxs.length

  const displayedConfirmedTxs = limit ? allConfirmedTxs.slice(0, limit - allPendingTxs.length) : allConfirmedTxs

  return (
    <Table isLoading={showSkeletonLoading} className={className} minWidth="500px">
      <TableHeaderRow>
        <TableTitle>{t('Latest transactions')}</TableTitle>
        <ActionLink onClick={() => navigate('/wallet/transfers')} Icon={ChevronRight}>
          {t('See more')}
        </ActionLink>
      </TableHeaderRow>
      {allPendingTxs.map((pendingTx) => (
        <TableRow key={pendingTx.hash} blinking role="row" tabIndex={0}>
          <TransactionalInfo transaction={pendingTx} addressHash={pendingTx.address.hash} />
        </TableRow>
      ))}
      {displayedConfirmedTxs.map((confirmedTx) => (
        <TableRow
          key={`${confirmedTx.hash}-${confirmedTx.address.hash}`}
          role="row"
          tabIndex={0}
          onClick={() => onTransactionClick(confirmedTx)}
          onKeyPress={() => onTransactionClick(confirmedTx)}
        >
          <TransactionalInfo transaction={confirmedTx} addressHash={confirmedTx.address.hash} />
        </TableRow>
      ))}
      {!isLoading && !allPendingTxs.length && !displayedConfirmedTxs.length && (
        <TableRow role="row" tabIndex={0}>
          <TableCellPlaceholder align="center">{t`No transactions to display`}</TableCellPlaceholder>
        </TableRow>
      )}
    </Table>
  )
}

export default OverviewPageTransactionList

const TableHeaderRow = styled(TableRow)`
  display: flex;
  justify-content: space-between;
  height: 60px;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const TableTitle = styled.div`
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
`
