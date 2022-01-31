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

import Amount from '../../components/Amount'
import Button from '../../components/Button'
import ClipboardButton from '../../components/Buttons/ClipboardButton'
import QRCodeButton from '../../components/Buttons/QRCodeButton'
import DataList, { DataListCell, DataListRow } from '../../components/DataList'
import Label from '../../components/Label'
import Modal from '../../components/Modal'
import { MainContent, PageTitleRow } from '../../components/PageComponents/PageContainers'
import { PageH1, PageH2 } from '../../components/PageComponents/PageHeadings'
import Table, { TableProps } from '../../components/Table'
import { useAddressesContext } from '../../contexts/addresses'
import { openInWebBrowser } from '../../utils/misc'
import { loadStoredSettings } from '../../utils/settings'

const transactionsTableHeaders: TableProps['headers'] = [
  { title: 'Direction' },
  { title: 'Timestamp' },
  { title: 'Address(es)' },
  { title: 'Amount', align: 'end' }
]

const AddressDetailsPage = () => {
  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)
  const { addressesState } = useAddressesContext()
  const { address } = useParams<{ address: string }>()
  const addressData = addressesState.get(address)
  const history = useHistory()

  const handleShowInExplorer = () => {
    const {
      network: { explorerUrl }
    } = loadStoredSettings()

    if (!explorerUrl) return

    const cleanURL = `${explorerUrl}/#/addresses/${address}`.replace(/([^:]\/)\/+/g, '$1') // Remove forward slashes duplicates if needed
    openInWebBrowser(cleanURL)
  }

  if (!addressData) return null

  return (
    <MainContent>
      <PageTitleRow>
        <Title>
          <ArrowLeftStyled onClick={() => history.goBack()} />
          <PageH1Styled>
            Address details {addressData.settings.isMain && <MainAddress>Main address</MainAddress>}
          </PageH1Styled>
          {addressData.settings.label && (
            <LabelStyled color={addressData.settings.color}>{addressData.settings.label}</LabelStyled>
          )}
        </Title>
        <Button short onClick={handleShowInExplorer}>
          Show in explorer
        </Button>
      </PageTitleRow>
      <DataList>
        <DataListRow>
          <DataListCell>Address</DataListCell>
          <DataListCell>
            {address} <ClipboardButton textToCopy={address} /> <QRCodeButton textToEncode={address} />
          </DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>Label</DataListCell>
          <DataListCell>
            {addressData.settings.label ? (
              <Label color={addressData.settings.color}>{addressData.settings.label}</Label>
            ) : (
              '-'
            )}
          </DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>Number of transactions</DataListCell>
          <DataListCell>-</DataListCell>
        </DataListRow>
        <DataListRow>
          <DataListCell>ALPH balance</DataListCell>
          <DataListCell>
            {addressData.details?.balance ? (
              <AmountStyled value={BigInt(addressData.details.balance)} fadeDecimals />
            ) : (
              '-'
            )}
          </DataListCell>
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

const PageH1Styled = styled(PageH1)`
  position: relative;
`

const MainAddress = styled.div`
  color: ${({ theme }) => theme.font.highlight};
  font-size: 9px;
  position: absolute;
`

export default AddressDetailsPage
