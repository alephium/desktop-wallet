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

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AssetBadge from '@/components/AssetBadge'
import Badge from '@/components/Badge'
import SelectOptionItemContent from '@/components/Inputs/SelectOptionItemContent'
import { useAppSelector } from '@/hooks/redux'
import { makeSelectAddressesTokens } from '@/storage/addresses/addressesSelectors'
import { Address } from '@/types/addresses'

interface SelectOptionAddressProps {
  address: Address
  isSelected: boolean
  className?: string
}

const SelectOptionAddress = ({ address, isSelected, className }: SelectOptionAddressProps) => {
  const { t } = useTranslation()
  const selectAddressesTokens = useMemo(makeSelectAddressesTokens, [])
  const assets = useAppSelector((s) => selectAddressesTokens(s, address.hash))

  const knownAssetsWithBalance = assets.filter((a) => a.balance > 0 && a.name)
  const unknownAssetsNb = assets.filter((a) => a.balance > 0 && !a.name).length

  return (
    <SelectOptionItemContent
      className={className}
      displaysCheckMarkWhenSelected
      isSelected={isSelected}
      contentDirection="column"
      MainContent={
        <Header>
          <AddressBadgeStyled addressHash={address.hash} disableA11y truncate />
          <Group>
            {t('Group')} {address.group}
          </Group>
        </Header>
      }
      SecondaryContent={
        <AssetList>
          {knownAssetsWithBalance.map((a) => (
            <AssetBadge key={a.id} assetId={a.id} amount={a.balance} withBackground />
          ))}
          {unknownAssetsNb > 0 && <Badge compact>+ {unknownAssetsNb}</Badge>}
        </AssetList>
      }
    />
  )
}

export default SelectOptionAddress

const Header = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Group = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-weight: 400;
`

const AddressBadgeStyled = styled(AddressBadge)`
  max-width: 200px;
  font-size: 17px;
`

const AssetList = styled.div`
  display: flex;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  align-items: center;
`
