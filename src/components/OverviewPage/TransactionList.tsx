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

import { Transaction } from '@alephium/sdk/api/explorer'
import { useTranslation } from 'react-i18next'

import ActionLink from '../../components/ActionLink'
import Table, { TableCell, TableCellPlaceholder, TableRow } from '../../components/Table'
import TransactionalInfo from '../../components/TransactionalInfo'
import { Address, SimpleTx, useAddressesContext } from '../../contexts/addresses'
import { sortTransactions } from '../../utils/transactions'

interface OverviewPageTransactionListProps {
  onTransactionClick: (transaction: Transaction & { address: Address }) => void
  className?: string
}

type WithAddress<T> = { data: T; address: Address }

const OverviewPageTransactionList = ({ className, onTransactionClick }: OverviewPageTransactionListProps) => {
  const { t } = useTranslation('App')
  const { addresses, fetchAddressTransactionsNextPage, isLoadingData } = useAddressesContext()
  const totalNumberOfTransactions = addresses.map((address) => address.details.txNumber).reduce((a, b) => a + b, 0)

  const allConfirmedTxs: WithAddress<Transaction>[] = addresses
    .map((address) =>
      address.transactions.confirmed.map((tx) => ({
        data: tx,
        address
      }))
    )
    .flat()
    .sort((a, b) => sortTransactions(a.data, b.data))

  const allPendingTxs: WithAddress<SimpleTx>[] = addresses
    .map((address) =>
      address.transactions.pending.map((tx) => ({
        data: tx,
        address
      }))
    )
    .flat()
    .sort((a, b) => sortTransactions(a.data, b.data))

  const loadNextTransactionsPage = async () => {
    addresses.forEach((address) => fetchAddressTransactionsNextPage(address))
  }

  const showSkeletonLoading = isLoadingData && !allConfirmedTxs.length && !allPendingTxs.length

  return (
    <Table isLoading={showSkeletonLoading} className={className} minWidth="500px">
      {allPendingTxs
        .slice(0)
        .reverse()
        .map(({ data: tx, address }: WithAddress<SimpleTx>) => (
          <TableRow key={tx.txId} blinking>
            {tx.type === 'transfer' && <TransactionalInfo transaction={tx} addressHash={address.hash} />}
          </TableRow>
        ))}
      {allConfirmedTxs.map(({ data: tx, address }: WithAddress<Transaction>) => {
        return (
          <TableRow key={`${tx.hash}-${address.hash}`} onClick={() => onTransactionClick({ ...tx, address })}>
            <TransactionalInfo transaction={tx} addressHash={address.hash} />
          </TableRow>
        )
      })}
      {allConfirmedTxs.length !== totalNumberOfTransactions && (
        <TableRow>
          <TableCell align="center">
            <ActionLink onClick={loadNextTransactionsPage}>{t`Show more`}</ActionLink>
          </TableCell>
        </TableRow>
      )}
      {!isLoadingData && !allPendingTxs.length && !allConfirmedTxs.length && (
        <TableRow>
          <TableCellPlaceholder>{t`No transactions to display`}</TableCellPlaceholder>
        </TableRow>
      )}
    </Table>
  )
}

export default OverviewPageTransactionList
