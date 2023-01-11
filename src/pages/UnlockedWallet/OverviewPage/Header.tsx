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
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ElementRef } from 'react-scrollbars-custom/dist/types/types'
import styled from 'styled-components'

import Button from '@/components/Button'
import Scrollbar from '@/components/Scrollbar'
import { useAddressesContext } from '@/contexts/addresses'
import DayskyImageSrc from '@/images/daysky.jpeg'
import NightskyImageSrc from '@/images/nightsky.png'
import { appHeaderHeightPx } from '@/style/globalStyles'
import { sortAddressList } from '@/utils/addresses'

import AddressSummaryCard, { addressSummaryCardWidthPx } from './AddressSummaryCard'
import WalletSummaryCard from './WalletSummaryCard'

const OverviewPageHeader = ({ className }: { className?: string }) => {
  const { t } = useTranslation('App')
  const [areAddressSummariesExpanded, setAreAddressSummariesExpanded] = useState(false)
  const { addresses, isLoadingData } = useAddressesContext()
  const scrollbarRef = useRef<HTMLDivElement | null>(null)

  const onElementRef: ElementRef<HTMLDivElement> = useCallback(
    (element) => {
      const scrollbar = element?.querySelector('.ScrollbarsCustom-Scroller')
      if (!scrollbar) return

      scrollbarRef.current = scrollbar as HTMLDivElement

      const onWheel = (event: Event) => {
        const _event = event as WheelEvent
        const delta = _event.deltaY

        if (delta > 3 || delta < -3) {
          _event.preventDefault()
          scrollbar.scrollLeft = scrollbar.scrollLeft + delta
        }
      }

      scrollbar.addEventListener('wheel', onWheel)

      return () => {
        scrollbar.removeEventListener('wheel', onWheel)
      }
    },
    [scrollbarRef]
  )

  useEffect(() => {
    if (!areAddressSummariesExpanded && scrollbarRef.current) {
      scrollbarRef.current.scrollLeft = 0
    }
  }, [areAddressSummariesExpanded])

  return (
    <Header className={className}>
      <TopGradient />
      <Summaries>
        <WalletSummaryCardStyled isLoading={isLoadingData} />
        <Scrollbar noScrollY isDynamic elementRef={onElementRef} noScrollX={!areAddressSummariesExpanded}>
          <AddressSummaryCards collapsed={!areAddressSummariesExpanded} totalAddresses={addresses.length}>
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
        </Scrollbar>
        <ExpandButton onClick={() => setAreAddressSummariesExpanded(!areAddressSummariesExpanded)} short transparent>
          {areAddressSummariesExpanded && <ArrowLeft size="12px" />}
          {areAddressSummariesExpanded ? t`Reduce` : t`Show addresses`}
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
  align-items: center;
  gap: ${addressSummaryCardsGapPx}px;

  height: 100%;
  width: ${({ collapsed, totalAddresses }) =>
    collapsed
      ? `${totalAddresses * collapsedaddressSummaryCardWidthPx + addressSummaryCardsGapPx}px`
      : `${
          totalAddresses * (addressSummaryCardWidthPx + addressSummaryCardsGapPx) +
          (expandButtonLeftMarginPx - addressSummaryCardsGapPx)
        }px`};
  margin-left: calc(var(--spacing-2) * -1);
  padding-left: var(--spacing-4);

  overflow: hidden;
  transition: width 0.2s ease-out;
`

const WalletSummaryCardStyled = styled(WalletSummaryCard)`
  flex-shrink: 0;
`

const AddressSummaryCardStyled = styled(AddressSummaryCard)<{ index: number; clickable: boolean }>`
  order: ${({ index, clickable }) => (!clickable ? index * -1 : index)};
`

const ExpandButton = styled(Button)`
  flex-shrink: 0;
  align-self: center;
  gap: var(--spacing-1);

  margin-left: ${expandButtonLeftMarginPx}px;

  background-color: ${({ theme }) => theme.bg.accent};
  color: ${({ theme }) => theme.font.primary};
`
