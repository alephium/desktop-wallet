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

import { Wrench } from 'lucide-react'
import { CSSProperties, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import Toggle from '@/components/Inputs/Toggle'
import { useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import NewAddressModal from '@/modals/NewAddressModal'
import AddressGridRow from '@/pages/UnlockedWallet/AddressesPage/AddressGridRow'
import AdvancedOperationsSideModal from '@/pages/UnlockedWallet/AddressesPage/AdvancedOperationsSideModal'
import TabContent from '@/pages/UnlockedWallet/AddressesPage/TabContent'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { appHeaderHeightPx } from '@/style/globalStyles'
import { filterAddresses } from '@/utils/addresses'

interface AddressesTabContentProps {
  tabsRowHeight: number
}

const AddressesTabContent = ({ tabsRowHeight }: AddressesTabContentProps) => {
  const addresses = useAppSelector(selectAllAddresses)
  const assetsInfo = useAppSelector((state) => state.assetsInfo.entities)
  const { t } = useTranslation()

  const [isGenerateNewAddressModalOpen, setIsGenerateNewAddressModalOpen] = useState(false)
  const [visibleAddresses, setVisibleAddresses] = useState(addresses)
  const [searchInput, setSearchInput] = useState('')
  const [hideEmptyAddresses, setHideEmptyAddresses] = useState(false)
  const [isAdvancedOperationsModalOpen, setIsAdvancedOperationsModalOpen] = useState(false)

  useEffect(() => {
    const filteredByText = filterAddresses(addresses, searchInput.toLowerCase(), assetsInfo)
    const filteredByToggle = hideEmptyAddresses
      ? filteredByText.filter((address) => address.balance !== '0')
      : filteredByText

    setVisibleAddresses(filteredByToggle)
  }, [addresses, assetsInfo, hideEmptyAddresses, searchInput])

  return (
    <TabContent
      searchPlaceholder={t('Search for label, a hash or an asset...')}
      onSearch={setSearchInput}
      buttonText={`+ ${t('New address')}`}
      onButtonClick={() => setIsGenerateNewAddressModalOpen(true)}
      HeaderMiddleComponent={
        <HeaderMiddle>
          <HideEmptyAddressesToggle>
            <ToggleText>{t('Hide empty addresses')}</ToggleText>
            <Toggle onToggle={setHideEmptyAddresses} label={t('Hide empty addresses')} toggled={hideEmptyAddresses} />
          </HideEmptyAddressesToggle>
          <Button role="secondary" squared Icon={Wrench} onClick={() => setIsAdvancedOperationsModalOpen(true)} />
        </HeaderMiddle>
      }
    >
      <TableGrid>
        <GridHeaderRow tabsRowHeight={tabsRowHeight}>
          <HeaderCell>{t('Address')}</HeaderCell>
          <HeaderCell>{t('Assets')}</HeaderCell>
          <HeaderCell justifyContent="flex-end">{t('ALPH amount')}</HeaderCell>
          <HeaderCell justifyContent="flex-end">{t('Total value')}</HeaderCell>
        </GridHeaderRow>

        {visibleAddresses.map((address) => (
          <AddressGridRow addressHash={address.hash} key={address.hash} />
        ))}
      </TableGrid>

      <ModalPortal>
        {isAdvancedOperationsModalOpen && (
          <AdvancedOperationsSideModal onClose={() => setIsAdvancedOperationsModalOpen(false)} />
        )}
        {isGenerateNewAddressModalOpen && (
          <NewAddressModal
            singleAddress
            title={t('New address')}
            onClose={() => setIsGenerateNewAddressModalOpen(false)}
          />
        )}
      </ModalPortal>
    </TabContent>
  )
}

export default AddressesTabContent

const HideEmptyAddressesToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 250px;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 10px 18px 10px 22px;
  border-radius: var(--radius-medium);
`

const ToggleText = styled.div`
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`

const HeaderMiddle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex: 1;
`

const TableGrid = styled(Box)`
  contain: paint; // This is amazing. It replaces "overflow: hidden". Using "overflow" on this prevents us from having a sticky table header.
  display: flex;
  flex-direction: column;
  gap: 1px;
  background-color: ${({ theme }) => theme.border.primary};
`

const GridRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1px;
`

const GridHeaderRow = styled(GridRow)<AddressesTabContentProps>`
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
  min-height: var(--inputHeight);
  width: 100%;

  position: sticky;
  top: ${({ tabsRowHeight }) => tabsRowHeight + appHeaderHeightPx - 1}px;
  z-index: 1;
`

const Cell = styled.div`
  padding: 15px 20px;
`

const HeaderCell = styled(Cell)<{ justifyContent?: CSSProperties['justifyContent'] }>`
  display: flex;
  justify-content: ${({ justifyContent }) => justifyContent ?? 'center'};
  align-items: center;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.tertiary};
`
