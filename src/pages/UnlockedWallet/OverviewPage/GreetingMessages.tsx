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

import { formatFiatAmountForDisplay } from '@alephium/sdk'
import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInOut } from '@/animations'
import { useAppSelector } from '@/hooks/redux'
import TimeOfDayMessage from '@/pages/UnlockedWallet/OverviewPage/TimeOfDayMessage'
import { useGetPriceQuery } from '@/storage/assets/priceApiSlice'
import { currencies } from '@/utils/currencies'

interface GreetingMessagesProps {
  className?: string
}

const swapDelayInSeconds = 8

const GreetingMessages = ({ className }: GreetingMessagesProps) => {
  const { t } = useTranslation()
  const activeWallet = useAppSelector((s) => s.activeWallet)

  const fiatCurrency = useAppSelector((s) => s.settings.fiatCurrency)
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies[fiatCurrency].ticker, {
    pollingInterval: 60000
  })

  const [currentComponentIndex, setCurrentComponentIndex] = useState(0)
  const [lastClickTime, setLastChangeTime] = useState(Date.now())

  const priceComponent = (
    <span key="price">
      {price ? '📈 ' + t('ALPH price: {{ price }}', { price: formatFiatAmountForDisplay(price) }) : ''}
      {currencies[fiatCurrency].symbol}
    </span>
  )

  const componentList = [
    <TimeOfDayMessage key="timeOfDay" />,
    priceComponent,
    <span key="currentWallet">
      👛 {t('Wallet')}: {activeWallet.name}
    </span>,
    priceComponent
  ]

  const showNextMessage = useCallback(() => {
    setCurrentComponentIndex((prevIndex) => {
      if (prevIndex === 0 && (isPriceLoading || price == null)) {
        return prevIndex
      }
      return (prevIndex + 1) % componentList.length
    })
    setLastChangeTime(Date.now())
  }, [componentList.length, isPriceLoading, price])

  const handleClick = useCallback(() => {
    showNextMessage()
  }, [showNextMessage])

  useEffect(() => {
    const remainingTime = Math.max(swapDelayInSeconds * 1000 - (Date.now() - lastClickTime), 0)
    const intervalId = setInterval(() => {
      showNextMessage()
    }, remainingTime)

    return () => clearInterval(intervalId)
  }, [lastClickTime, showNextMessage])

  return (
    <AnimatePresence mode="wait">
      <motion.div className={className} key={currentComponentIndex} onClick={handleClick} {...fadeInOut}>
        {componentList[currentComponentIndex]}
      </motion.div>
    </AnimatePresence>
  )
}

export default styled(GreetingMessages)`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  height: 44px;
  margin-left: 70px;
  font-size: 16px;
  font-weight: var(--fontWeight-normal);
  color: ${({ theme }) => theme.font.secondary};
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  box-shadow: ${({ theme }) => theme.shadow.primary};
  padding: 0 15px;
  border-radius: 50px;

  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.font.primary};
  }

  transition: all ease-out 0.2s;
`
