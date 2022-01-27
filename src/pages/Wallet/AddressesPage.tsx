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

import addressToGroup from 'alephium-js/dist/lib/address'
import { TOTAL_NUMBER_OF_GROUPS } from 'alephium-js/dist/lib/constants'
import { deriveNewAddressData } from 'alephium-js/dist/lib/wallet'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import ActionLink from '../../components/ActionLink'
import Amount from '../../components/Amount'
import Button from '../../components/Button'
import Label from '../../components/Label'
import Modal from '../../components/Modal'
import { MainContent } from '../../components/PageComponents/PageContainers'
import PageTitle from '../../components/PageComponents/PageTitle'
import Table, { AlignType, TableCell, TableFooter, TableRow } from '../../components/Table'
import { useGlobalContext } from '../../contexts/global'
import NewAddressPage from './NewAddressPage'

const minTableColumnWidth = '105px'

type AddressesTableData = {
  hash: string
  isMain: boolean
  label?: {
    text?: string
    color?: string
  }
  lastUsed: string
  transactions: number
  tokens: number
  group: number
  amount: bigint
}

const AddressesPage = () => {
  const [isGenerateNewAddressModalOpen, setIsGenerateNewAddressModalOpen] = useState(false)
  const { addressesInfo, wallet, client } = useGlobalContext()
  const [addressesTableData, setAddressesTableData] = useState<AddressesTableData[]>([])
  const headers = [
    { title: 'Address' },
    { title: 'Label' },
    { title: 'Last used' },
    { title: 'Transactions' },
    { title: 'Nb. of tokens' },
    { title: 'Group' },
    { title: 'ALPH amount', align: 'end' as AlignType }
  ]

  useEffect(() => {
    if (!wallet?.seed || !client) return

    const fetchAddressesInfo = async () => {
      const tableData = []
      for (const { index, label, color, isMain } of addressesInfo) {
        const { address } = deriveNewAddressData(wallet.seed, undefined, index)
        const {
          data: { txNumber, balance }
        } = await client.explorer.getAddressDetails(address)

        tableData.push({
          hash: address,
          isMain,
          label: {
            text: label,
            color
          },
          lastUsed: '-', // TODO
          transactions: txNumber,
          tokens: 0, // TODO
          group: addressToGroup(address, TOTAL_NUMBER_OF_GROUPS),
          amount: BigInt(balance)
        })
      }
      setAddressesTableData(tableData)
    }

    fetchAddressesInfo()
  }, [addressesInfo, client, wallet])

  return (
    <MainContent>
      <PageTitleRow>
        <PageTitle>Addresses</PageTitle>
        <Button narrow onClick={() => setIsGenerateNewAddressModalOpen(true)}>
          + Generate new address
        </Button>
      </PageTitleRow>
      <Table headers={headers} minColumnWidth={minTableColumnWidth}>
        {addressesTableData.map((row) => (
          <TableRow key={row.hash} minColumnWidth={minTableColumnWidth}>
            <TableCell>
              <AddressHash>{row.hash}</AddressHash>
              {row.isMain && <MainAddress>Main address</MainAddress>}
            </TableCell>
            <TableCell>{row.label?.text && <Label color={row.label.color}>{row.label.text}</Label>}</TableCell>
            <TableCell>{row.lastUsed}</TableCell>
            <TableCell>{row.transactions}</TableCell>
            <TableCell>{row.tokens}</TableCell>
            <TableCell>{row.group}</TableCell>
            <TableCell align="end">
              <Amount value={row.amount} fadeDecimals />
            </TableCell>
          </TableRow>
        ))}
        <TableFooterStyled cols={headers.length} minColumnWidth={minTableColumnWidth}>
          <TableCell>
            <ActionLink onClick={() => setIsGenerateNewAddressModalOpen(true)}>+ Generate new address</ActionLink>
          </TableCell>
          <Summary align="end">
            <Amount value={addressesTableData.reduce((acc, row) => acc + row.amount, BigInt(0))} fadeDecimals />
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

const PageTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`

const AddressHash = styled.div`
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
