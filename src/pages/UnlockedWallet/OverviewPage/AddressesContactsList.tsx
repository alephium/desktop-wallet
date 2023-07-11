/*
Copyright 2018 - 2023 The Alephium Authors
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

import { calculateAmountWorth } from '@alephium/sdk'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import ActionLink from '@/components/ActionLink'
import AddressRow from '@/components/AddressRow'
import Amount from '@/components/Amount'
import FocusableContent from '@/components/FocusableContent'
import SkeletonLoader from '@/components/SkeletonLoader'
import { ExpandableTable, ExpandRow, TableHeader } from '@/components/Table'
import TableCellAmount from '@/components/TableCellAmount'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import ModalPortal from '@/modals/ModalPortal'
import { selectAllAddresses, selectIsStateUninitialized } from '@/storage/addresses/addressesSelectors'
import { useGetPriceQuery } from '@/storage/assets/priceApiSlice'
import { Address } from '@/types/addresses'
import { currencies } from '@/utils/currencies'

interface AddressesContactsListProps {
  className?: string
  maxHeightInPx?: number
}

interface AddressListProps extends AddressesContactsListProps {
  isExpanded?: boolean
  onExpand?: () => void
  onAddressClick: () => void
}

const AddressesContactsList = ({ className, maxHeightInPx }: AddressesContactsListProps) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [isExpanded, setIsExpanded] = useState(false)

  const handleButtonClick = () => setIsExpanded(!isExpanded)

  const collapse = () => setIsExpanded(false)

  return (
    <FocusableContent className={className} isFocused={isExpanded} onClose={collapse}>
      <ExpandableTable isExpanded={isExpanded} maxHeightInPx={maxHeightInPx}>
        <TableHeader title={t('Your addresses')}>
          <ActionLink onClick={() => navigate('/wallet/addresses')} Icon={ChevronRight} withBackground>
            {t('See more')}
          </ActionLink>
        </TableHeader>
        <AddressesList isExpanded={isExpanded} onExpand={handleButtonClick} onAddressClick={collapse} />
      </ExpandableTable>
    </FocusableContent>
  )
}

const AddressesList = ({ className, isExpanded, onExpand, onAddressClick }: AddressListProps) => {
  const addresses = useAppSelector(selectAllAddresses)
  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const { data: price } = useGetPriceQuery(currencies[fiatCurrency].ticker)
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)

  const [selectedAddress, setSelectedAddress] = useState<Address>()

  const handleRowClick = (address: Address) => {
    onAddressClick()
    setSelectedAddress(address)
  }

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {addresses.map((address) => (
          <AddressRow address={address} onClick={handleRowClick} key={address.hash}>
            <TableCellAmount>
              {stateUninitialized ? (
                <SkeletonLoader height="15.5px" width="50%" />
              ) : (
                <AmountStyled
                  value={calculateAmountWorth(BigInt(address.balance), price ?? 0)}
                  isFiat
                  suffix={currencies[fiatCurrency].symbol}
                  tabIndex={0}
                />
              )}
            </TableCellAmount>
          </AddressRow>
        ))}
      </motion.div>

      {!isExpanded && addresses.length > 5 && onExpand && <ExpandRow onClick={onExpand} />}

      <ModalPortal>
        {selectedAddress && (
          <AddressDetailsModal addressHash={selectedAddress.hash} onClose={() => setSelectedAddress(undefined)} />
        )}
      </ModalPortal>
    </>
  )
}

export default styled(AddressesContactsList)`
  margin-bottom: 45px;
`

const AmountStyled = styled(Amount)`
  flex-shrink: 0;
`
