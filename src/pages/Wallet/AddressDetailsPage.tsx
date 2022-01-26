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

import { AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'

import DataList, { DataListCell, DataListRow } from '../../components/DataList'
import Modal from '../../components/Modal'
import { MainContent } from '../../components/PageComponents/PageContainers'
import { PageH1, PageH2 } from '../../components/PageComponents/PageHeadings'
import Table, { TableProps } from '../../components/Table'

const transactionsTableHeaders: TableProps['headers'] = [
  { title: 'Direction' },
  { title: 'Timestamp' },
  { title: 'Address(es)' },
  { title: 'Amount', align: 'end' }
]

const AddressDetailsPage = () => {
  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)
  const { address } = useParams<{ address: string }>()
  const history = useHistory()

  return (
    <MainContent>
      <PageTitleRow>
        <PageH1Styled>
          <ArrowLeftStyled onClick={() => history.goBack()} />
          Address details
        </PageH1Styled>
      </PageTitleRow>
      <DataList>
        <DataListRow>
          <DataListCell>Address</DataListCell>
          <DataListCell>{address}</DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>Label</DataListCell>
          <DataListCell>-</DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>Number of transactions</DataListCell>
          <DataListCell>-</DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>ALPH balance</DataListCell>
          <DataListCell>-</DataListCell>
        </DataListRow>
      </DataList>
      <PageH2>Transaction history</PageH2>
      <Table headers={transactionsTableHeaders} minColumnWidth={'104px'}></Table>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isAddressOptionsModalOpen && (
          <Modal title="Address options" onClose={() => setIsAddressOptionsModalOpen(false)}>
            {/* <AddressOptionsModal /> */}
          </Modal>
        )}
      </AnimatePresence>
    </MainContent>
  )
}

const PageH1Styled = styled(PageH1)`
  display: flex;
  align-items: center;
`

const ArrowLeftStyled = styled(ArrowLeft)`
  margin-right: var(--spacing-2);

  &:hover {
    cursor: pointer;
  }
`

const PageTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`

export default AddressDetailsPage
