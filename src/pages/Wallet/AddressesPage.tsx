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

import dayjs from 'dayjs'
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import ActionLink from '../../components/ActionLink'
import Amount from '../../components/Amount'
import Button from '../../components/Button'
import Label from '../../components/Label'
import Modal from '../../components/Modal'
import { MainContent, PageTitleRow } from '../../components/PageComponents/PageContainers'
import { PageH1 } from '../../components/PageComponents/PageHeadings'
import Table, { TableCell, TableFooter, TableProps, TableRow } from '../../components/Table'
import { AddressHash, useAddressesContext } from '../../contexts/addresses'
import NewAddressPage from './NewAddressPage'

const minTableColumnWidth = '105px'

const addressesTableHeaders: TableProps['headers'] = [
  { title: 'Address' },
  { title: 'Label' },
  { title: 'Last used' },
  { title: 'Transactions' },
  { title: 'Group' },
  { title: 'ALPH amount', align: 'end' }
]

const AddressesPage = () => {
  const [isGenerateNewAddressModalOpen, setIsGenerateNewAddressModalOpen] = useState(false)
  const { addressesState } = useAddressesContext()
  const addressesData = [...addressesState.values()]
  const history = useHistory()

  const navigateToAddressDetailsPage = (addressHash: AddressHash) => {
    history.push(`/wallet/addresses/${addressHash}`)
  }

  const balanceSummary = addressesData.reduce(
    (acc, row) => acc + BigInt(row.details ? row.details.balance : 0),
    BigInt(0)
  )

  return (
    <MainContent>
      <PageTitleRow>
        <PageH1>Addresses</PageH1>
        <Button short onClick={() => setIsGenerateNewAddressModalOpen(true)}>
          + Generate new address
        </Button>
      </PageTitleRow>
      <Table headers={addressesTableHeaders} minColumnWidth={minTableColumnWidth}>
        {addressesData.map((address) => {
          return (
            <TableRow
              key={address.hash}
              minColumnWidth={minTableColumnWidth}
              onClick={() => navigateToAddressDetailsPage(address.hash)}
            >
              <TableCell>
                <Hash>{address.hash}</Hash>
                {address.settings.isMain && <MainAddress>Main address</MainAddress>}
              </TableCell>
              <TableCell>
                {address.settings.label ? <Label color={address.settings.color}>{address.settings.label}</Label> : '-'}
              </TableCell>
              <TableCell>{address.lastUsed ? dayjs(address.lastUsed).fromNow() : '-'}</TableCell>
              <TableCell>{address.details?.txNumber ?? 0}</TableCell>
              <TableCell>{address.group}</TableCell>
              <TableCell align="end">
                <Amount value={BigInt(address.details?.balance ?? 0)} fadeDecimals />
              </TableCell>
            </TableRow>
          )
        })}
        <TableFooterStyled cols={addressesTableHeaders.length} minColumnWidth={minTableColumnWidth}>
          <TableCell>
            <ActionLink onClick={() => setIsGenerateNewAddressModalOpen(true)}>+ Generate new address</ActionLink>
          </TableCell>
          <Summary align="end">
            <Amount value={balanceSummary} fadeDecimals />
          </Summary>
        </TableFooterStyled>
      </Table>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isGenerateNewAddressModalOpen && (
          <Modal title="New address" onClose={() => setIsGenerateNewAddressModalOpen(false)}>
            <NewAddressPage />
          </Modal>
        )}
      </AnimatePresence>
    </MainContent>
  )
}

const Hash = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MainAddress = styled.div`
  color: ${({ theme }) => theme.font.highlight};
  font-size: 9px;
`

const TableFooterStyled = styled(TableFooter)<{ cols: number }>`
  grid-template-columns: ${({ cols }) =>
    `minmax(calc(${cols - 1} * ${minTableColumnWidth}), ${cols - 1}fr) minmax(${minTableColumnWidth}, 1fr)`};
`

const Summary = styled(TableCell)`
  color: ${({ theme }) => theme.font.highlight};
`

export default AddressesPage
