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
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '../../components/ActionLink'
import Amount from '../../components/Amount'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import ClipboardButton from '../../components/Buttons/ClipboardButton'
import OpenInExplorerButton from '../../components/Buttons/OpenInExplorerButton'
import QRCodeButton from '../../components/Buttons/QRCodeButton'
import DataList, { DataListCell, DataListRow } from '../../components/DataList'
import IOList from '../../components/IOList'
import Label from '../../components/Label'
import MainAddressLabel from '../../components/MainAddressLabel'
import { MainContent, PageTitleRow } from '../../components/PageComponents/PageContainers'
import { PageH1, PageH2 } from '../../components/PageComponents/PageHeadings'
import Table, { TableCell, TableCellPlaceholder, TableProps, TableRow } from '../../components/Table'
import TransactionBadge from '../../components/TransactionBadge'
import { AddressHash, useAddressesContext } from '../../contexts/addresses'
import AddressOptionsModal from './AddressOptionsModal'
import TransactionDetailsModal from './TransactionDetailsModal'

const transactionsTableHeaders: TableProps['headers'] = [
  { title: 'Direction' },
  { title: 'Timestamp' },
  { title: 'Address(es)' },
  { title: 'Amount', align: 'end' }
]

const minTableColumnWidth = '104px'

const AddressDetailsPage = () => {
  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>()
  const { getAddress, fetchAddressTransactionsNextPage } = useAddressesContext()
  const { addressHash } = useParams<{ addressHash: AddressHash }>()
  const address = getAddress(addressHash)
  const history = useHistory()

  if (!address) return null

  const loadNextTransactionsPage = () => {
    fetchAddressTransactionsNextPage(address)
  }

  const onTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  return (
    <MainContent>
      <PageTitleRow>
        <Title>
          <ArrowLeftStyled onClick={() => history.goBack()} />
          <PageH1Styled>Address details {address.settings.isMain && <MainAddressLabel />}</PageH1Styled>
          {address.settings.label && <LabelStyled color={address.settings.color}>{address.labelDisplay()}</LabelStyled>}
          <OptionsButton
            transparent
            squared
            onClick={() => setIsAddressOptionsModalOpen(true)}
            aria-label="Address options"
          >
            <SettingsIcon />
          </OptionsButton>
        </Title>
      </PageTitleRow>
      <DataList>
        <DataListRow>
          <DataListCell>Address</DataListCell>
          <DataListCell>
            {addressHash}
            <ClipboardButton textToCopy={addressHash} />
            <QRCodeButton textToEncode={addressHash} />
            <OpenInExplorerButton address={addressHash} />
          </DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>Label</DataListCell>
          <DataListCell>
            {address.settings.label ? <Label color={address.settings.color}>{address.labelDisplay()}</Label> : '-'}
          </DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>Number of transactions</DataListCell>
          <DataListCell>{address.details?.txNumber}</DataListCell>
        </DataListRow>
        {address.details?.lockedBalance && BigInt(address.details.lockedBalance) > 0 && (
          <DataListRow>
            <DataListCell>Locked ALPH balance</DataListCell>
            <DataListCell>
              <Amount value={BigInt(address.details.lockedBalance)} fadeDecimals />
            </DataListCell>
          </DataListRow>
        )}
        <DataListRow>
          <DataListCell>Total ALPH balance</DataListCell>
          <DataListCell>
            {address.details?.balance ? <AmountStyled value={BigInt(address.details.balance)} fadeDecimals /> : '-'}
          </DataListCell>
        </DataListRow>
      </DataList>
      <PageH2>Transaction history</PageH2>
      <Table headers={transactionsTableHeaders} minColumnWidth={minTableColumnWidth}>
        {address.transactions.pending
          .slice(0)
          .reverse()
          .map(({ txId, timestamp, toAddress, amount, type }) => (
            <TableRow key={txId} minColumnWidth={minTableColumnWidth} blinking>
              <TableCell>
                <Badge content="Pending" type="neutral" />
              </TableCell>
              <TableCell>{dayjs(timestamp).fromNow()}</TableCell>
              <TableCell truncate>
                <TransactionBadge type="neutral" content="To" />
                <span>{toAddress}</span>
              </TableCell>
              <TableCell align="end">
                {type === 'transfer' && amount && <Badge type="minus" prefix="-" content={amount} amount />}
              </TableCell>
            </TableRow>
          ))}
        {address.transactions.confirmed.map((transaction) => {
          const amount = calAmountDelta(transaction, addressHash)
          const amountIsBigInt = typeof amount === 'bigint'
          const isOut = amountIsBigInt && amount < 0

          return (
            <TableRow
              key={transaction.hash}
              minColumnWidth={minTableColumnWidth}
              onClick={() => onTransactionClick(transaction)}
            >
              <TableCell>
                <Badge content={isOut ? '↑ Sent' : '↓ Received'} type={isOut ? 'neutral' : 'plus'} />
              </TableCell>
              <TableCell>{dayjs(transaction.timestamp).fromNow()}</TableCell>
              <TableCell truncate>
                <TransactionBadge type="neutral" content={isOut ? 'To' : 'From'} />
                <IOList
                  currentAddress={addressHash}
                  isOut={isOut}
                  outputs={transaction.outputs}
                  inputs={transaction.inputs}
                  timestamp={transaction.timestamp}
                />
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
        {address.transactions.confirmed.length !== address.details.txNumber && (
          <TableRow>
            <TableCell align="center">
              <ActionLink onClick={loadNextTransactionsPage}>Show more</ActionLink>
            </TableCell>
          </TableRow>
        )}
        {address.transactions.pending.length === 0 && address.transactions.confirmed.length === 0 && (
          <TableRow>
            <TableCellPlaceholder align="center">No transactions to display</TableCellPlaceholder>
          </TableRow>
        )}
      </Table>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isAddressOptionsModalOpen && (
          <AddressOptionsModal address={address} onClose={() => setIsAddressOptionsModalOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedTransaction && (
          <TransactionDetailsModal
            address={address}
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(undefined)}
          />
        )}
      </AnimatePresence>
    </MainContent>
  )
}

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

const AmountStyled = styled(Amount)`
  color: ${({ theme }) => theme.font.highlight};
`

const LabelStyled = styled(Label)`
  margin-left: var(--spacing-5);
`

const OptionsButton = styled(Button)`
  margin-left: var(--spacing-5);
  color: ${({ theme }) => theme.font.primary};
`

const PageH1Styled = styled(PageH1)`
  position: relative;
`

export default AddressDetailsPage
