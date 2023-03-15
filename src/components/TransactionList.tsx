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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import ActionLink from '@/components/ActionLink'
import Table, { TableCell, TableCellPlaceholder, TableHeader, TableRow } from '@/components/Table'
import TransactionalInfo from '@/components/TransactionalInfo'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import TransactionDetailsModal from '@/modals/TransactionDetailsModal'
import {
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from '@/storage/addresses/addressesActions'
import { selectAddressByHash, selectAddressIds, selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import {
  selectAddressesConfirmedTransactions,
  selectAddressesPendingTransactions
} from '@/storage/transactions/transactionsSelectors'
import { AddressHash } from '@/types/addresses'
import { AddressConfirmedTransaction } from '@/types/transactions'

interface TransactionListProps {
  addressHash?: AddressHash
  className?: string
  title?: string
  limit?: number
  compact?: boolean
}

const TransactionList = ({ className, addressHash, title, limit, compact }: TransactionListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash ?? ''))
  const allAddresses = useAppSelector(selectAllAddresses)
  const allAddressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const addressHashes = addressHash ? [addressHash] : allAddressHashes
  const addresses = addressHash && address ? [address] : allAddresses
  const [confirmedTxs, pendingTxs, allTransactionsLoaded, isLoading] = useAppSelector((s) => [
    selectAddressesConfirmedTransactions(s, addressHashes),
    selectAddressesPendingTransactions(s, addressHashes),
    s.addresses.allTransactionsLoaded,
    s.addresses.loading
  ])

  const [selectedTransaction, setSelectedTransaction] = useState<AddressConfirmedTransaction>()

  const singleAddress = addresses.length === 1
  const totalNumberOfTransactions = addresses.map((address) => address.txNumber).reduce((a, b) => a + b, 0)
  const showSkeletonLoading = isLoading && !confirmedTxs.length && !pendingTxs.length
  const displayedConfirmedTxs = limit ? confirmedTxs.slice(0, limit - pendingTxs.length) : confirmedTxs
  const showAllTransactionsLoadedMsg = singleAddress ? address?.allTransactionPagesLoaded : allTransactionsLoaded

  const loadNextTransactionsPage = () =>
    singleAddress
      ? dispatch(syncAddressTransactionsNextPage(addresses[0].hash))
      : dispatch(syncAllAddressesTransactionsNextPage())

  return (
    <>
      <Table isLoading={showSkeletonLoading} className={className} minWidth="500px">
        <TableHeader title={title ?? t('Transactions')}>
          {limit !== undefined && (
            <ActionLink onClick={() => navigate('/wallet/transfers')} Icon={ChevronRight}>
              {t('See more')}
            </ActionLink>
          )}
        </TableHeader>
        {pendingTxs.map((tx) => (
          <TableRow key={tx.hash} blinking role="row" tabIndex={0}>
            <TransactionalInfo
              transaction={tx}
              addressHash={tx.address.hash}
              showInternalInflows={singleAddress}
              compact={compact}
            />
          </TableRow>
        ))}
        {displayedConfirmedTxs.map((tx) => (
          <TableRow
            key={`${tx.hash}-${tx.address.hash}`}
            role="row"
            tabIndex={0}
            onClick={() => setSelectedTransaction(tx)}
            onKeyPress={() => setSelectedTransaction(tx)}
          >
            <TransactionalInfo
              transaction={tx}
              addressHash={tx.address.hash}
              showInternalInflows={singleAddress}
              compact={compact}
            />
          </TableRow>
        ))}
        {limit === undefined && confirmedTxs.length !== totalNumberOfTransactions && (
          <TableRow role="row">
            <TableCell align="center" role="gridcell">
              {showAllTransactionsLoadedMsg ? (
                <span>{t('All transactions loaded!')}</span>
              ) : (
                <ActionLink onClick={loadNextTransactionsPage}>{t`Show more`}</ActionLink>
              )}
            </TableCell>
          </TableRow>
        )}
        {!isLoading && !pendingTxs.length && !confirmedTxs.length && (
          <TableRow role="row" tabIndex={0}>
            <TableCellPlaceholder align="center">{t`No transactions to display`}</TableCellPlaceholder>
          </TableRow>
        )}
      </Table>
      <ModalPortal>
        {selectedTransaction && (
          <TransactionDetailsModal
            address={selectedTransaction.address}
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(undefined)}
          />
        )}
      </ModalPortal>
    </>
  )
}

export default TransactionList
