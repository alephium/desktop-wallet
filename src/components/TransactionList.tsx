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
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import SkeletonLoader from '@/components/SkeletonLoader'
import Spinner from '@/components/Spinner'
import Table, { TableCell, TableCellPlaceholder, TableHeader, TableRow } from '@/components/Table'
import TransactionalInfo from '@/components/TransactionalInfo'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import TransactionDetailsModal from '@/modals/TransactionDetailsModal'
import {
  syncAddressTransactionsNextPage,
  syncAllAddressesTransactionsNextPage
} from '@/storage/addresses/addressesActions'
import { selectAddresses, selectAllAddresses, selectIsStateUninitialized } from '@/storage/addresses/addressesSelectors'
import {
  selectAddressesConfirmedTransactions,
  selectAddressesPendingTransactions
} from '@/storage/transactions/transactionsSelectors'
import { AddressHash } from '@/types/addresses'
import { Asset } from '@/types/assets'
import { AddressConfirmedTransaction, Direction } from '@/types/transactions'
import { getTransactionInfo } from '@/utils/transactions'

interface TransactionListProps {
  addressHashes?: AddressHash[]
  className?: string
  title?: string
  limit?: number
  compact?: boolean
  hideHeader?: boolean
  hideFromColumn?: boolean
  directions?: Direction[]
  assetIds?: Asset['id'][]
  headerExtraContent?: ReactNode
}

const maxAttemptsToFindNewTxs = 10

const TransactionList = ({
  className,
  addressHashes,
  title,
  limit,
  compact,
  hideHeader = false,
  hideFromColumn = false,
  directions,
  assetIds,
  headerExtraContent
}: TransactionListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const addresses = useAppSelector(
    addressHashes && addressHashes.length > 0 ? (s) => selectAddresses(s, addressHashes) : selectAllAddresses
  )
  const hashes = addresses.map((address) => address.hash)
  const confirmedTxs = useAppSelector((s) => selectAddressesConfirmedTransactions(s, hashes))
  const pendingTxs = useAppSelector((s) => selectAddressesPendingTransactions(s, hashes))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const finishedLoadingData = useAppSelector((s) => !s.addresses.loading)

  const [selectedTransaction, setSelectedTransaction] = useState<AddressConfirmedTransaction>()
  const [nextPageToLoad, setNextPageToLoad] = useState(1)
  const [allTransactionsLoaded, setAllTransactionsLoaded] = useState(false)
  const [attemptToFindNewFilteredTxs, setAttemptToFindNewFilteredTxs] = useState(0)

  const singleAddress = addresses.length === 1
  const filteredConfirmedTxs = applyFilters({ txs: confirmedTxs, directions, assetIds, hideFromColumn })
  const displayedConfirmedTxs = limit ? filteredConfirmedTxs.slice(0, limit - pendingTxs.length) : filteredConfirmedTxs
  const totalNumberOfTransactions = addresses.map((address) => address.txNumber).reduce((a, b) => a + b, 0)
  const isFetching = attemptToFindNewFilteredTxs > 0 && attemptToFindNewFilteredTxs <= maxAttemptsToFindNewTxs

  const lastFilteredTxsLength = useRef(filteredConfirmedTxs.length)
  const shouldStopFetchingTxs = lastFilteredTxsLength.current < filteredConfirmedTxs.length
  const shouldContinueFetchingTxs = finishedLoadingData && lastFilteredTxsLength.current === filteredConfirmedTxs.length

  const handleShowMoreClick = () => {
    setAttemptToFindNewFilteredTxs(1)
    loadNextTransactionsPage()
  }

  const loadNextTransactionsPage = useCallback(async () => {
    if (singleAddress) {
      dispatch(syncAddressTransactionsNextPage(addresses[0].hash))
    } else {
      const { nextPage, transactions } = await dispatch(
        syncAllAddressesTransactionsNextPage({ nextPage: nextPageToLoad })
      ).unwrap()

      setNextPageToLoad(nextPage)
      setAllTransactionsLoaded(transactions.length === 0)
    }
  }, [addresses, dispatch, nextPageToLoad, singleAddress])

  useEffect(() => {
    if (!allTransactionsLoaded && isFetching) {
      if (shouldStopFetchingTxs) {
        lastFilteredTxsLength.current = filteredConfirmedTxs.length
        setAttemptToFindNewFilteredTxs(0)
      } else if (shouldContinueFetchingTxs) {
        setAttemptToFindNewFilteredTxs(attemptToFindNewFilteredTxs + 1)
        loadNextTransactionsPage()
      }
    } else {
      setAttemptToFindNewFilteredTxs(0)
    }
  }, [
    allTransactionsLoaded,
    attemptToFindNewFilteredTxs,
    filteredConfirmedTxs.length,
    isFetching,
    loadNextTransactionsPage,
    shouldContinueFetchingTxs,
    shouldStopFetchingTxs
  ])

  useEffect(() => {
    if (singleAddress) setAllTransactionsLoaded(addresses[0].allTransactionPagesLoaded)
  }, [addresses, singleAddress])

  return (
    <>
      <Table className={className} minWidth="500px">
        {!hideHeader && (
          <TableHeader title={title ?? t('Transactions')}>
            {headerExtraContent}
            {limit !== undefined && (
              <ActionLinkStyled onClick={() => navigate('/wallet/transfers')} Icon={ChevronRight}>
                {t('See more')}
              </ActionLinkStyled>
            )}
          </TableHeader>
        )}
        {stateUninitialized && (
          <>
            <TableRow>
              <SkeletonLoader height="37.5px" />
            </TableRow>
            <TableRow>
              <SkeletonLoader height="37.5px" />
            </TableRow>
            <TableRow>
              <SkeletonLoader height="37.5px" />
            </TableRow>
          </>
        )}
        {pendingTxs.map((tx) => (
          <TableRow key={tx.hash} blinking role="row" tabIndex={0}>
            <TransactionalInfo
              transaction={tx}
              addressHash={tx.address.hash}
              showInternalInflows={hideFromColumn}
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
              showInternalInflows={hideFromColumn}
              compact={compact}
            />
          </TableRow>
        ))}
        {limit === undefined && confirmedTxs.length !== totalNumberOfTransactions && (
          <TableRow role="row">
            <TableCell align="center" role="gridcell">
              {allTransactionsLoaded ? (
                <span>{t('All transactions loaded!')}</span>
              ) : isFetching ? (
                <Spinner size="15px" />
              ) : (
                <ActionLink onClick={handleShowMoreClick}>{t('Show more')}</ActionLink>
              )}
            </TableCell>
          </TableRow>
        )}
        {!stateUninitialized && !pendingTxs.length && !confirmedTxs.length && (
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

const applyFilters = ({
  txs,
  hideFromColumn,
  directions,
  assetIds
}: Pick<TransactionListProps, 'directions' | 'assetIds' | 'hideFromColumn'> & {
  txs: AddressConfirmedTransaction[]
}) => {
  const isDirectionsFilterEnabled = directions && directions.length > 0
  const isAssetsFilterEnabled = assetIds && assetIds.length > 0

  return isDirectionsFilterEnabled || isAssetsFilterEnabled
    ? txs.filter((tx) => {
        const { assets, infoType } = getTransactionInfo(tx, hideFromColumn)
        const dir = infoType === 'pending' ? 'out' : infoType

        const passedDirectionsFilter = !isDirectionsFilterEnabled || directions.includes(dir)
        const passedAssetsFilter = !isAssetsFilterEnabled || assets.some((asset) => assetIds.includes(asset.id))

        return passedDirectionsFilter && passedAssetsFilter
      })
    : txs
}

const ActionLinkStyled = styled(ActionLink)`
  margin-left: 20px;
`
