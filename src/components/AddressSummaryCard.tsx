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

import { motion } from 'framer-motion'
import { useHistory } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { Address } from '../contexts/addresses'
import AddressBadge from './AddressBadge'
import Amount from './Amount'
import ClipboardButton from './Buttons/ClipboardButton'
import QRCodeButton from './Buttons/QRCodeButton'

interface AddressSummaryCardProps {
  address: Address
  totalCards: number
  index: number
  clickable?: boolean
  className?: string
  position?: number
}

export const addressSummaryCardWidthPx = 100

const AddressSummaryCard = ({ address, clickable, className, index, totalCards }: AddressSummaryCardProps) => {
  const history = useHistory()

  const collapsedPosition = !clickable ? (totalCards - index) * -109 + 5 : 0

  return (
    <motion.div
      className={className}
      initial={{ x: collapsedPosition - 20 }}
      animate={{ x: collapsedPosition }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <ClickableArea
        onClick={() => clickable && history.push(`/wallet/addresses/${address.hash}`)}
        clickable={clickable}
      >
        <AddressNameSection collapsed={!clickable}>
          <AddressBadgeStyled color={address.settings.color} addressName={address.getLabelName()} truncate />
        </AddressNameSection>
        <AmountsSection collapsed={!clickable}>
          <AmountHighlighted value={BigInt(address.details.balance)} fadeDecimals />
        </AmountsSection>
      </ClickableArea>
      <ButtonsSection collapsed={!clickable}>
        <ClipboardButton textToCopy={address.hash} />
        <QRCodeButton textToEncode={address.hash} />
      </ButtonsSection>
    </motion.div>
  )
}

export default styled(AddressSummaryCard)`
  display: flex;
  flex-direction: column;
  width: ${addressSummaryCardWidthPx}px;
  height: 95%;

  ${({ clickable }) =>
    !clickable &&
    css`
      background-color: ${({ theme }) => theme.bg.secondary};
      border-radius: var(--radius-medium);
      border: 1px solid ${({ theme }) => theme.border.primary};
    `}
`

const AddressNameSection = styled.div<{ collapsed: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: padding 0.2s ease-out;
  padding: 0 17px;

  ${({ collapsed }) =>
    !collapsed &&
    css`
      background-color: ${({ theme }) => theme.bg.secondary};
      border-top-left-radius: var(--radius-medium);
      border-top-right-radius: var(--radius-medium);
      padding: 0;
    `}
`

const AddressBadgeStyled = styled(AddressBadge)`
  width: 100%;
  padding: 11px 17px;
  border-radius: var(--radius-medium);
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  text-align: center;
`

const AmountsSection = styled.div<{ collapsed: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 11px 0;

  ${({ collapsed }) =>
    !collapsed &&
    css`
      border-top: 1px solid ${({ theme }) => theme.border.primary};
      background-color: ${({ theme }) => theme.bg.primary};
    `}
`

const AmountHighlighted = styled(Amount)`
  font-size: 1.2em;
`

const ButtonsSection = styled.div<{ collapsed: boolean }>`
  display: flex;
  gap: var(--spacing-4);
  justify-content: center;
  padding: 11px 17px;

  ${({ collapsed }) =>
    !collapsed &&
    css`
      border: 1px solid ${({ theme }) => theme.border.secondary};
      background-color: ${({ theme }) => theme.bg.secondary};
      border-bottom-left-radius: var(--radius-medium);
      border-bottom-right-radius: var(--radius-medium);
    `}
`

const ClickableArea = styled.div<{ clickable?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
`
