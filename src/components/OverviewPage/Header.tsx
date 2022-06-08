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
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import AddressSummaryCard, { addressSummaryCardWidthPx } from '../../components/AddressSummaryCard'
import Button from '../../components/Button'
import GradientCanvas from '../../components/GradientCanvas'
import WalletSummaryCard from '../../components/WalletSummaryCard'
import { useAddressesContext } from '../../contexts/addresses'
import DayskyImageSrc from '../../images/daysky.jpeg'
import NightskyImageSrc from '../../images/nightsky.png'
import { appHeaderHeightPx } from '../../style/globalStyles'
import { sortAddressList } from '../../utils/addresses'

const OverviewPageHeader = ({ className }: { className?: string }) => {
  const [areAddressSummariesExpanded, setAreAddressSummariesExpanded] = useState(false)
  const { addresses, isLoadingData } = useAddressesContext()
  const addressSummaryCardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!areAddressSummariesExpanded && addressSummaryCardsRef.current) {
      addressSummaryCardsRef.current.scrollLeft = 0
    }
  }, [areAddressSummariesExpanded])

  useEffect(() => {
    const cards = addressSummaryCardsRef.current
    if (!cards || !areAddressSummariesExpanded) return

    const onWheel = (event: WheelEvent) => {
      const delta = event.deltaY
      if (delta > 3 || delta < -3) {
        event.preventDefault()
        cards.scrollLeft += delta
      }
    }
    cards.addEventListener('wheel', onWheel)

    return () => {
      cards.removeEventListener('wheel', onWheel)
    }
  })

  return (
    <Header className={className}>
      <TopGradient />
      <GradientCanvas />
      <Summaries>
        <WalletSummaryCardStyled isLoading={isLoadingData} />
        <AddressSummaryCards
          collapsed={!areAddressSummariesExpanded}
          totalAddresses={addresses.length}
          ref={addressSummaryCardsRef}
        >
          <AnimatePresence>
            {sortAddressList(addresses).map((address, index) => (
              <AddressSummaryCardStyled
                key={address.hash}
                address={address}
                index={index}
                clickable={areAddressSummariesExpanded}
                totalCards={addresses.length}
              />
            ))}
          </AnimatePresence>
        </AddressSummaryCards>
        <ExpandButton onClick={() => setAreAddressSummariesExpanded(!areAddressSummariesExpanded)} short transparent>
          {areAddressSummariesExpanded && <ArrowLeft size="12px" />}
          {areAddressSummariesExpanded ? 'Reduce' : 'Show addresses'}
          {!areAddressSummariesExpanded && <ArrowRight size="12px" />}
        </ExpandButton>
      </Summaries>
    </Header>
  )
}

export default OverviewPageHeader

const addressSummaryCardsGapPx = 15
const expandButtonLeftMarginPx = 20
const collapsedaddressSummaryCardWidthPx = 10

const Header = styled.header`
  position: relative;
  background-image: url(${({ theme }) => (theme.name === 'dark' ? NightskyImageSrc : DayskyImageSrc)});
  background-position: bottom;
  background-size: cover;
  margin-top: -${appHeaderHeightPx}px;
  margin-left: -56px;
  margin-right: -56px;
  padding: 56px;
  padding-top: 70px;
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
`

const TopGradient = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 60px;
  background: linear-gradient(
    ${({ theme }) =>
      theme.name === 'light'
        ? 'rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0)'
        : 'rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0)'}
  );
`

const Summaries = styled.div`
  display: flex;
`

const AddressSummaryCards = styled.div<{ collapsed: boolean; totalAddresses: number }>`
  display: flex;
  gap: ${addressSummaryCardsGapPx}px;
  overflow: ${({ collapsed }) => (collapsed ? 'hidden' : 'auto')};
  margin-left: calc(var(--spacing-2) * -1);
  padding-left: var(--spacing-4);
  align-items: center;
  width: ${({ collapsed, totalAddresses }) =>
    collapsed
      ? `${totalAddresses * collapsedaddressSummaryCardWidthPx + addressSummaryCardsGapPx}px`
      : `${
          totalAddresses * (addressSummaryCardWidthPx + addressSummaryCardsGapPx) +
          (expandButtonLeftMarginPx - addressSummaryCardsGapPx)
        }px`};
  transition: width 0.2s ease-out;
  z-index: 1;
`

const WalletSummaryCardStyled = styled(WalletSummaryCard)`
  flex-shrink: 0;
  z-index: 2;
`

const AddressSummaryCardStyled = styled(AddressSummaryCard)<{ index: number; clickable: boolean }>`
  order: ${({ index, clickable }) => (!clickable ? index * -1 : index)};
`

const ExpandButton = styled(Button)`
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.bg.accent};
  color: ${({ theme }) => theme.font.primary};
  margin-left: ${expandButtonLeftMarginPx}px;
  gap: var(--spacing-1);
  z-index: 0;
  align-self: center;
`
