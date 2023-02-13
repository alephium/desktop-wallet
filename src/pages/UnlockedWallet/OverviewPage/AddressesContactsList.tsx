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

import { convertSetToFiat } from '@alephium/sdk'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import AddressEllipsed from '@/components/AddressEllipsed'
import Amount from '@/components/Amount'
import DotIcon from '@/components/DotIcon'
import Table, { TableRow } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import { useAppSelector } from '@/hooks/redux'
import { selectAllAddresses } from '@/storage/app-state/slices/addressesSlice'
import { useGetPriceQuery } from '@/storage/app-state/slices/priceApiSlice'
import { Address } from '@/types/addresses'
import { currencies } from '@/utils/currencies'

interface AddressesContactsListProps {
  className?: string
}

const AddressesContactsList = ({ className }: AddressesContactsListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const addresses = useAppSelector(selectAllAddresses)
  const [isLoadingAddresses] = useAppSelector((s) => [s.addresses.loading])
  const { data: price } = useGetPriceQuery(currencies.USD.ticker)

  const handleAddressClick = (address: Address) => navigate(`/wallet/addresses/${address.hash}`)

  return (
    <Table isLoading={isLoadingAddresses} className={className} minWidth="500px">
      <TableHeaderRow>
        <TableTitle>
          {t('Addresses')} ({addresses.length})
        </TableTitle>
      </TableHeaderRow>
      {addresses.map((address) => (
        <TableRow
          key={address.hash}
          role="row"
          tabIndex={0}
          onClick={() => handleAddressClick(address)}
          onKeyPress={() => handleAddressClick(address)}
        >
          <Row>
            <AddressColor>
              {address.isDefault ? <Star color={address.color}>★</Star> : <DotIcon size="big" color={address.color} />}
            </AddressColor>
            {address.label ? (
              <Column>
                <Label>{address.label}</Label>
                <Hash addressHash={address.hash} />
              </Column>
            ) : (
              <Label>
                <AddressEllipsed addressHash={address.hash} />
              </Label>
            )}
            <TableCellAmount>
              <Amount
                value={convertSetToFiat(BigInt(address.balance), price ?? 0)}
                fadeDecimals
                isFiat
                suffix={currencies['USD'].symbol}
                tabIndex={0}
              />
            </TableCellAmount>
          </Row>
        </TableRow>
      ))}
    </Table>
  )
}

export default styled(AddressesContactsList)`
  margin-bottom: 45px;
`

const TableHeaderRow = styled(TableRow)`
  display: flex;
  justify-content: space-between;
  height: 60px;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const TableTitle = styled.div`
  font-size: 13px;
  font-weight: var(--fontWeight-semiBold);
`

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const Label = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
  width: 200px;
`

const Hash = styled(AddressEllipsed)`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
  max-width: 100px;
`

const AddressColor = styled.div`
  width: 18px;
  display: flex;
  justify-content: center;
  margin-right: 15px;
`

const Star = styled.div<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 18px;
`
