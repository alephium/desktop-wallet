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

import { getDirection } from '@alephium/sdk'
import { Transaction } from '@alephium/sdk/api/explorer'
import { useTranslation } from 'react-i18next'

import ActionLink from '@/components/ActionLink'
import Table, { TableCell, TableCellPlaceholder, TableRow } from '@/components/Table'
import TransactionalInfo from '@/components/TransactionalInfo'
import { Address, useAddressesContext } from '@/contexts/addresses'
import { PendingTx } from '@/types/transactions'
import { GENESIS_TIMESTAMP } from '@/utils/constants'
import { BelongingToAddress, getTransactionsForAddresses, hasOnlyInputsWith } from '@/utils/transactions'

interface OverviewPageTransactionListProps {
  onTransactionClick: (transaction: Transaction & { address: Address }) => void
  className?: string
}

const OverviewPageTransactionList = ({ className, onTransactionClick }: OverviewPageTransactionListProps) => {
  const { t } = useTranslation()
  const { addresses, fetchAddressTransactionsNextPage, isLoadingData } = useAddressesContext()
  const totalNumberOfTransactions = addresses.map((address) => address.details.txNumber).reduce((a, b) => a + b, 0)

  const allConfirmedTxs = getTransactionsForAddresses('confirmed', addresses)
  const allPendingTxs = getTransactionsForAddresses('pending', addresses)

  const loadNextTransactionsPage = async () => {
    addresses.forEach((address) => fetchAddressTransactionsNextPage(address))
  }
  const showSkeletonLoading = isLoadingData && !allConfirmedTxs.length && !allPendingTxs.length

  const shouldHideTx = (tx: Transaction, address: Address) =>
    tx.inputs &&
    tx.inputs.length > 0 &&
    hasOnlyInputsWith(tx.inputs, addresses) &&
    getDirection(tx, address.hash) == 'in' &&
    tx.timestamp !== GENESIS_TIMESTAMP

  return (
    <Table isLoading={showSkeletonLoading} className={className} minWidth="500px">
      {allPendingTxs.map(({ data: tx, address }: BelongingToAddress<PendingTx>) => (
        <TableRow key={tx.txId} blinking role="row" tabIndex={0}>
          <TransactionalInfo transaction={tx} addressHash={address.hash} />
        </TableRow>
      ))}
      {allConfirmedTxs.map(({ data: tx, address }: BelongingToAddress<Transaction>) => {
        if (shouldHideTx(tx, address)) return null
        return (
          <TableRow
            key={`${tx.hash}-${address.hash}`}
            role="row"
            tabIndex={0}
            onClick={() => onTransactionClick({ ...tx, address })}
            onKeyPress={() => onTransactionClick({ ...tx, address })}
          >
            <TransactionalInfo transaction={tx} addressHash={address.hash} />
          </TableRow>
        )
      })}
      {allConfirmedTxs.length !== totalNumberOfTransactions && (
        <TableRow role="row">
          <TableCell align="center" role="gridcell">
            <ActionLink onClick={loadNextTransactionsPage}>{t`Show more`}</ActionLink>
          </TableCell>
        </TableRow>
      )}
      {!isLoadingData && !allPendingTxs.length && !allConfirmedTxs.length && (
        <TableRow role="row" tabIndex={0}>
          <TableCellPlaceholder align="center">{t`No transactions to display`}</TableCellPlaceholder>
        </TableRow>
      )}
    </Table>
  )
}

export default OverviewPageTransactionList
