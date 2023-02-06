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
import { motion } from 'framer-motion'
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import AddressEllipsed from '@/components/AddressEllipsed'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import Button from '@/components/Button'
import OpenInExplorerButton from '@/components/Buttons/OpenInExplorerButton'
import QRCodeButton from '@/components/Buttons/QRCodeButton'
import DataList, { DataListCell, DataListRow } from '@/components/DataList'
import MainAddressLabel from '@/components/MainAddressLabel'
import { PageTitleRow } from '@/components/PageComponents/PageContainers'
import { PageH1, PageH2 } from '@/components/PageComponents/PageHeadings'
import Table, { TableCell, TableCellPlaceholder, TableRow } from '@/components/Table'
import Tooltip from '@/components/Tooltip'
import TransactionalInfo from '@/components/TransactionalInfo'
import { useAddressesContext } from '@/contexts/addresses'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import AddressOptionsModal from '@/modals/AddressOptionsModal'
import ModalPortal from '@/modals/ModalPortal'
import TransactionDetailsModal from '@/modals/TransactionDetailsModal'
import { syncAddressTransactionsNextPage } from '@/store/addressesSlice'
import { selectAddressesConfirmedTransactions } from '@/store/confirmedTransactionsSlice'
import { AddressHash } from '@/types/addresses'

const AddressDetailsPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { getAddress } = useAddressesContext()
  const isPassphraseUsed = useAppSelector((state) => state.activeWallet.isPassphraseUsed)
  const { addressHash = '' } = useParams<{ addressHash: AddressHash }>()
  const confirmedTxs = useAppSelector((state) => selectAddressesConfirmedTransactions(state, [addressHash]))

  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>()

  const address = getAddress(addressHash)

  if (!address) return null

  const loadNextTransactionsPage = () => dispatch(syncAddressTransactionsNextPage(address.hash))

  const onTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const goBack = () => navigate(-1)

  return (
    <motion.div {...fadeIn}>
      <PageTitleRow>
        <Title>
          <ArrowLeftStyled role="button" tabIndex={0} onClick={goBack} onKeyPress={goBack} />
          <PageH1Styled>
            {t`Address details`} {address.settings.isMain && !isPassphraseUsed && <MainAddressLabelStyled />}
          </PageH1Styled>
          {address.settings.label && <AddressBadgeStyled address={address} hideStar />}
          <OptionsButton
            transparent
            squared
            role="secondary"
            onClick={() => setIsAddressOptionsModalOpen(true)}
            aria-label={t`Address options`}
          >
            <SettingsIcon />
          </OptionsButton>
        </Title>
      </PageTitleRow>
      <DataList role="grid" tabIndex={0}>
        <DataListRow role="row">
          <DataListCell role="gridcell" tabIndex={0}>{t`Address`}</DataListCell>
          <DataListCell>
            <IconButtons>
              <AddressEllipsed addressHash={addressHash} role="gridcell" tabIndex={0} />
              <QRCodeButton textToEncode={addressHash} />
              <OpenInExplorerButton address={addressHash} />
            </IconButtons>
          </DataListCell>
        </DataListRow>
        <DataListRow role="row">
          <DataListCell role="gridcell" tabIndex={0}>
            Label
          </DataListCell>
          <DataListCell role="gridcell" tabIndex={0}>
            {address.settings.label ? <AddressBadge address={address} truncate hideStar /> : '-'}
          </DataListCell>
        </DataListRow>
        <DataListRow role="row">
          <DataListCell role="gridcell" tabIndex={0}>
            {t`Number of transactions`}
          </DataListCell>
          <DataListCell role="gridcell" tabIndex={0}>
            {address.details?.txNumber}
          </DataListCell>
        </DataListRow>
        {address.details?.lockedBalance && BigInt(address.details.lockedBalance) > 0 && (
          <DataListRow role="row">
            <DataListCell role="gridcell" tabIndex={0}>
              {t`Locked ALPH balance`}
            </DataListCell>
            <DataListCell role="gridcell" tabIndex={0}>
              <Badge>
                <Amount value={BigInt(address.details.lockedBalance)} fadeDecimals />
              </Badge>
            </DataListCell>
          </DataListRow>
        )}
        <DataListRow role="row">
          <DataListCell role="gridcell" tabIndex={0}>
            {t`Total ALPH balance`}
          </DataListCell>
          <DataListCell role="gridcell" tabIndex={0}>
            {address.details?.balance ? (
              <Badge border>
                <Amount value={BigInt(address.details.balance)} fadeDecimals />
              </Badge>
            ) : (
              '-'
            )}
          </DataListCell>
        </DataListRow>
      </DataList>
      <PageH2>{t`Transaction history`}</PageH2>
      <Table minWidth="500px">
        {address.transactions.pending
          .slice(0)
          .reverse()
          .map((transaction) => (
            <TableRow role="row" tabIndex={0} key={transaction.txId} blinking>
              <TransactionalInfo transaction={transaction} showInternalInflows />
            </TableRow>
          ))}
        {confirmedTxs.map((transaction) => (
          <TableRow
            role="row"
            tabIndex={0}
            key={transaction.hash}
            onClick={() => onTransactionClick(transaction)}
            onKeyPress={() => onTransactionClick(transaction)}
          >
            <TransactionalInfo transaction={transaction} showInternalInflows />
          </TableRow>
        ))}
        {confirmedTxs.length !== address.details.txNumber && (
          <TableRow role="row">
            <TableCell align="center" role="gridcell">
              <ActionLink onClick={loadNextTransactionsPage}>{t`Show more`}</ActionLink>
            </TableCell>
          </TableRow>
        )}
        {address.transactions.pending.length === 0 && confirmedTxs.length === 0 && (
          <TableRow role="row" tabIndex={0}>
            <TableCellPlaceholder align="center" role="gridcell">
              {t`No transactions to display`}
            </TableCellPlaceholder>
          </TableRow>
        )}
      </Table>
      <ModalPortal>
        {isAddressOptionsModalOpen && (
          <AddressOptionsModal address={address} onClose={() => setIsAddressOptionsModalOpen(false)} />
        )}
        {selectedTransaction && (
          <TransactionDetailsModal
            address={address}
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(undefined)}
          />
        )}
      </ModalPortal>
      <Tooltip />
    </motion.div>
  )
}

export default AddressDetailsPage

const Title = styled.div`
  display: flex;
  align-items: center;
`

const ArrowLeftStyled = styled(ArrowLeft)`
  margin-right: var(--spacing-2);

  &:hover {
    cursor: pointer;
  }
`

const AddressBadgeStyled = styled(AddressBadge)`
  margin-left: var(--spacing-5);
`

const MainAddressLabelStyled = styled(MainAddressLabel)`
  margin-top: 2px;
`

const OptionsButton = styled(Button)`
  margin-left: var(--spacing-5);
  color: ${({ theme }) => theme.font.primary};
`

const PageH1Styled = styled(PageH1)`
  position: relative;
`

const IconButtons = styled.div`
  display: flex;
  overflow: hidden;

  > svg {
    margin-left: 10px;
    min-width: fit-content;
  }
`
