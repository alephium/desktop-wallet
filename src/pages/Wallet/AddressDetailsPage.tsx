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
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '../../components/ActionLink'
import AddressBadge from '../../components/AddressBadge'
import Amount from '../../components/Amount'
import Badge from '../../components/Badge'
import Button from '../../components/Button'
import ClipboardButton from '../../components/Buttons/ClipboardButton'
import OpenInExplorerButton from '../../components/Buttons/OpenInExplorerButton'
import QRCodeButton from '../../components/Buttons/QRCodeButton'
import DataList, { DataListCell, DataListRow } from '../../components/DataList'
import MainAddressLabel from '../../components/MainAddressLabel'
import { MainContent, PageTitleRow } from '../../components/PageComponents/PageContainers'
import { PageH1, PageH2 } from '../../components/PageComponents/PageHeadings'
import Table, { TableCell, TableCellPlaceholder, TableRow } from '../../components/Table'
import Tooltip from '../../components/Tooltip'
import TransactionalInfo from '../../components/TransactionalInfo'
import Truncate from '../../components/Truncate'
import { AddressHash, useAddressesContext } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import AddressOptionsModal from '../../modals/AddressOptionsModal'
import TransactionDetailsModal from '../../modals/TransactionDetailsModal'

const AddressDetailsPage = () => {
  const { t } = useTranslation('App')
  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction>()
  const { getAddress, fetchAddressTransactionsNextPage } = useAddressesContext()
  const { isPassphraseUsed } = useGlobalContext()
  const { addressHash = '' } = useParams<{ addressHash: AddressHash }>()
  const address = getAddress(addressHash)
  const navigate = useNavigate()

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
          <ArrowLeftStyled onClick={() => navigate(-1)} />
          <PageH1Styled>
            {t`Address details`} {address.settings.isMain && !isPassphraseUsed && <MainAddressLabelStyled />}
          </PageH1Styled>
          {address.settings.label && <AddressBadgeStyled address={address} />}
          <OptionsButton
            transparent
            squared
            onClick={() => setIsAddressOptionsModalOpen(true)}
            aria-label={t`Address options`}
          >
            <SettingsIcon />
          </OptionsButton>
        </Title>
      </PageTitleRow>
      <DataList>
        <DataListRow>
          <DataListCell>{t`Address`}</DataListCell>
          <DataListCell>
            <Truncate>{addressHash}</Truncate>
            <IconButtons>
              <ClipboardButton textToCopy={addressHash} />
              <QRCodeButton textToEncode={addressHash} />
              <OpenInExplorerButton address={addressHash} />
            </IconButtons>
          </DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>Label</DataListCell>
          <DataListCell>{address.settings.label ? <AddressBadge address={address} truncate /> : '-'}</DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>{t`Number of transactions`}</DataListCell>
          <DataListCell>{address.details?.txNumber}</DataListCell>
        </DataListRow>
        {address.details?.lockedBalance && BigInt(address.details.lockedBalance) > 0 && (
          <DataListRow>
            <DataListCell>{t`Locked ALPH balance`}</DataListCell>
            <DataListCell>
              <Badge>
                <Amount value={BigInt(address.details.lockedBalance)} fadeDecimals />
              </Badge>
            </DataListCell>
          </DataListRow>
        )}
        <DataListRow>
          <DataListCell>{t`Total ALPH balance`}</DataListCell>
          <DataListCell>
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
            <TableRow key={transaction.txId} blinking>
              {transaction.type === 'transfer' && <TransactionalInfo hideLabel transaction={transaction} />}
            </TableRow>
          ))}
        {address.transactions.confirmed.map((transaction) => {
          return (
            <TableRow key={transaction.hash} onClick={() => onTransactionClick(transaction)}>
              <TransactionalInfo hideLabel transaction={transaction} />
            </TableRow>
          )
        })}
        {address.transactions.confirmed.length !== address.details.txNumber && (
          <TableRow>
            <TableCell align="center">
              <ActionLink onClick={loadNextTransactionsPage}>{t`Show more`}</ActionLink>
            </TableCell>
          </TableRow>
        )}
        {address.transactions.pending.length === 0 && address.transactions.confirmed.length === 0 && (
          <TableRow>
            <TableCellPlaceholder align="center">{t`No transactions to display`}</TableCellPlaceholder>
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
      <Tooltip />
    </MainContent>
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
  margin-left: var(--spacing-2);

  > svg {
    margin-left: 10px;
  }
`
