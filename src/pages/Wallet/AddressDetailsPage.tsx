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
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import styled from 'styled-components'

import Amount from '../../components/Amount'
import Button from '../../components/Button'
import ClipboardButton from '../../components/Buttons/ClipboardButton'
import OpenInExplorerButton from '../../components/Buttons/OpenInExplorerButton'
import QRCodeButton from '../../components/Buttons/QRCodeButton'
import DataList, { DataListCell, DataListRow } from '../../components/DataList'
import Label from '../../components/Label'
import { MainContent, PageTitleRow } from '../../components/PageComponents/PageContainers'
import { PageH1, PageH2 } from '../../components/PageComponents/PageHeadings'
import Table, { TableProps } from '../../components/Table'
import { AddressHash, useAddressesContext } from '../../contexts/addresses'
import AddressOptionsModal from './AddressOptionsModal'

const transactionsTableHeaders: TableProps['headers'] = [
  { title: 'Direction' },
  { title: 'Timestamp' },
  { title: 'Address(es)' },
  { title: 'Amount', align: 'end' }
]

const AddressDetailsPage = () => {
  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)
  const { addressesState } = useAddressesContext()
  const { addressHash } = useParams<{ addressHash: AddressHash }>()
  const addressData = addressesState.get(addressHash)
  const history = useHistory()

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
          <AddressOptionsModal addressHash={addressHash} onClose={() => setIsAddressOptionsModalOpen(false)} />
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

const MainAddress = styled.div`
  color: ${({ theme }) => theme.font.highlight};
  font-size: 9px;
  position: absolute;
`

export default AddressDetailsPage
