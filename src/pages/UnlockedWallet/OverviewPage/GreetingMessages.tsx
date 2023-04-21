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

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import TimeOfDayMessage from '@/pages/UnlockedWallet/OverviewPage/TimeOfDayMessage'
import { useGetPriceQuery } from '@/storage/assets/priceApiSlice'
import { currencies } from '@/utils/currencies'

interface GreetingMessagesProps {
  className?: string
}

const variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 }
}

const swapDelayInSeconds = 12

const GreetingMessages = ({ className }: GreetingMessagesProps) => {
  const { t } = useTranslation()
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies.USD.ticker, {
    pollingInterval: 60000
  })

  const [currentComponentIndex, setCurrentComponentIndex] = useState(0)

  const componentList = [
    <TimeOfDayMessage key="timeOfDay" />,
    <span key="price">{t('📈 ALPH price: {{ price }}$', { price })}</span>
  ]

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentComponentIndex((prevIndex) => {
        if (prevIndex === 0 && (isPriceLoading || price == null)) {
          return prevIndex
        }
        return (prevIndex + 1) % componentList.length
      })
    }, swapDelayInSeconds * 1000)

    return () => clearInterval(intervalId)
  }, [componentList.length, isPriceLoading, price])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        className={className}
        key={currentComponentIndex}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 1 }}
      >
        {componentList[currentComponentIndex]}
      </motion.div>
    </AnimatePresence>
  )
}

export default styled(GreetingMessages)`
  display: inline-flex;
  align-items: center;
  height: 40px;
  margin-left: 72px;
  margin-top: 3px;
  font-size: 16px;
  color: ${({ theme }) => theme.font.secondary};
  background-color: ${({ theme }) => theme.bg.background2};
  padding: 0 15px;
  border-radius: var(--radius-small);
  border: 1px solid ${({ theme }) => theme.border.secondary};

  transition: all ease-out 0.2s;
`
