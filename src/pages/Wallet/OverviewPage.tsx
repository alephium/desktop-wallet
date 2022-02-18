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

import { calAmountDelta } from 'alephium-js'
import { Transaction } from 'alephium-js/api/explorer'
import dayjs from 'dayjs'
import { AnimatePresence } from 'framer-motion'
import { FC, useState } from 'react'

import ActionLink from '../../components/ActionLink'
import Badge from '../../components/Badge'
import Label from '../../components/Label'
import { MainContent } from '../../components/PageComponents/PageContainers'
import { PageH2 } from '../../components/PageComponents/PageHeadings'
import Table, { TableCell, TableCellPlaceholder, TableProps, TableRow } from '../../components/Table'
import { Address, useAddressesContext } from '../../contexts/addresses'
import TransactionDetailsModal from './TransactionDetailsModal'

const transactionsTableHeaders: TableProps['headers'] = [
  { title: 'Direction' },
  { title: 'Timestamp' },
  { title: 'Address' },
  { title: 'Amount', align: 'end' }
]

const minTableColumnWidth = '104px'

type TransactionAndAddress = Transaction & { address: Address }

const OverviewPage: FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionAndAddress>()
  const { addresses, fetchAddressTransactionsNextPage } = useAddressesContext()

  const allConfirmedTxs = addresses
    .map((address) => address.transactions.confirmed.map((tx) => ({ ...tx, address })))
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp)

  const allPendingTxs = addresses
    .map((address) => address.transactions.pending.map((tx) => ({ ...tx, address })))
    .flat()
    .sort((a, b) => b.timestamp - a.timestamp)

  const totalNumberOfTransactions = addresses.map((address) => address.details.txNumber).reduce((a, b) => a + b, 0)

  const onTransactionClick = (transaction: TransactionAndAddress) => {
    setSelectedTransaction(transaction)
  }

  const loadNextTransactionsPage = async () => {
    addresses.forEach((address) => fetchAddressTransactionsNextPage(address))
  }

  return (
    <MainContent>
      <PageH2>Transaction history</PageH2>
      <Table headers={transactionsTableHeaders} minColumnWidth={minTableColumnWidth}>
        {allPendingTxs
          .slice(0)
          .reverse()
          .map(({ txId, timestamp, address, amount, type }) => (
            <TableRow key={txId} minColumnWidth={minTableColumnWidth} blinking>
              <TableCell>
                <Badge content="Pending" type="neutral" />
              </TableCell>
              <TableCell>{dayjs(timestamp).fromNow()}</TableCell>
              <TableCell truncate>
                <Label color={address.settings.color}>{address.labelDisplay()}</Label>
              </TableCell>
              <TableCell align="end">
                {type === 'transfer' && amount && <Badge type="neutral" prefix="-" content={amount} amount />}
              </TableCell>
            </TableRow>
          ))}
        {allConfirmedTxs.map((transaction) => {
          const amount = calAmountDelta(transaction, transaction.address.hash)
          const amountIsBigInt = typeof amount === 'bigint'
          const isOut = amountIsBigInt && amount < 0

          return (
            <TableRow
              key={`${transaction.hash}-${transaction.address.hash}`}
              minColumnWidth={minTableColumnWidth}
              onClick={() => onTransactionClick(transaction)}
            >
              <TableCell>
                <Badge content={isOut ? '↑ Sent' : '↓ Received'} type={isOut ? 'neutral' : 'plus'} />
              </TableCell>
              <TableCell>{dayjs(transaction.timestamp).fromNow()}</TableCell>
              <TableCell truncate>
                <Label color={transaction.address.settings.color}>{transaction.address.labelDisplay()}</Label>
              </TableCell>
              <TableCell align="end">
                <Badge
                  type={isOut ? 'neutral' : 'plus'}
                  prefix={isOut ? '- ' : '+ '}
                  content={amountIsBigInt && amount < 0 ? (amount * -1n).toString() : amount.toString()}
                  amount
                />
              </TableCell>
            </TableRow>
          )
        })}
        {allConfirmedTxs.length !== totalNumberOfTransactions && (
          <TableRow>
            <TableCell align="center">
              <ActionLink onClick={loadNextTransactionsPage}>Show more</ActionLink>
            </TableCell>
          </TableRow>
        )}
        {allPendingTxs.length === 0 && allConfirmedTxs.length === 0 && (
          <TableRow>
            <TableCellPlaceholder align="center">No transactions to display</TableCellPlaceholder>
          </TableRow>
        )}
      </Table>
      <AnimatePresence>
        {selectedTransaction && (
          <TransactionDetailsModal
            address={selectedTransaction.address}
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(undefined)}
          />
        )}
      </AnimatePresence>
    </MainContent>
  )
}

export default OverviewPage
