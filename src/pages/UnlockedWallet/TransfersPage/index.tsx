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

// import { Transaction } from '@alephium/sdk/api/explorer'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Select from '@/components/Inputs/Select'
import TransactionList from '@/components/TransactionList'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'
import { transfersPageInfoMessageClosed } from '@/storage/global/globalActions'
import { TransactionTimePeriod } from '@/types/transactions'
import { links } from '@/utils/links'
import { timePeriodsOptions } from '@/utils/transactions'

const TransfersPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const infoMessageClosed = useAppSelector((s) => s.global.transfersPageInfoMessageClosed)

  const [timePeriod, setTimePeriod] = useState<TransactionTimePeriod>('6m')

  const timePeriodSelectedOption = timePeriodsOptions.find((option) => option.value === timePeriod)

  const closeInfoMessage = () => dispatch(transfersPageInfoMessageClosed())

  return (
    <UnlockedWalletPage
      title={t('Transfers')}
      subtitle={t('Browse and download your transaction history. Execute new transfers easily.')}
      isInfoMessageVisible={!infoMessageClosed}
      closeInfoMessage={closeInfoMessage}
      infoMessageLink={links.faq}
      infoMessage={t('You have questions about transfers ? Click here!')}
    >
      <Filters>
        <TimePeriodTile>
          <Select
            label={t('Period')}
            controlledValue={timePeriodSelectedOption}
            options={timePeriodsOptions}
            onSelect={setTimePeriod}
            title={t('Select a period')}
            id="period"
            raised
            simpleMode
          />
        </TimePeriodTile>
      </Filters>
      <UnlockedWalletPanel top>
        <TransactionList hideHeader />
      </UnlockedWalletPanel>
    </UnlockedWalletPage>
  )
}

export default TransfersPage

const Filters = styled(UnlockedWalletPanel)`
  background-color: ${({ theme }) => theme.bg.tertiary};
  border-top: 1px solid;
  border-bottom: 1px solid;
  border-color: ${({ theme }) => theme.border.secondary};
  padding-bottom: 0;
  display: flex;
`

const FilterTile = styled.div`
  padding: 10px;
  border-right: 1px solid ${({ theme }) => theme.border.secondary};
`

const TimePeriodTile = styled(FilterTile)`
  max-width: 200px;
`
