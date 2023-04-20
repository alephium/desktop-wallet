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
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Amount from '@/components/Amount'
import Button from '@/components/Button'
import DeltaPercentage from '@/components/DeltaPercentage'
import HistoricWorthChart from '@/components/HistoricWorthChart'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useAppSelector } from '@/hooks/redux'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import {
  makeSelectAddresses,
  makeSelectAddressesHaveHistoricBalances,
  selectAddressIds,
  selectIsStateUninitialized
} from '@/storage/addresses/addressesSelectors'
import { useGetPriceQuery } from '@/storage/assets/priceApiSlice'
import { AddressHash } from '@/types/addresses'
import { ChartLength, chartLengths, DataPoint } from '@/types/chart'
import { getAvailableBalance } from '@/utils/addresses'
import { currencies } from '@/utils/currencies'

interface AmountsOverviewPanelProps {
  addressHash?: string
  isLoading?: boolean
  className?: string
  showChart?: boolean
}

const AmountsOverviewPanel: FC<AmountsOverviewPanelProps> = ({ className, addressHash, children, showChart }) => {
  const { t } = useTranslation()
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const allAddressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const addressHashes = addressHash ?? allAddressHashes
  const selectAddresses = useMemo(makeSelectAddresses, [])
  const addresses = useAppSelector((s) => selectAddresses(s, addressHashes))
  const network = useAppSelector((s) => s.network)
  const selectAddressesHaveHistoricBalances = useMemo(makeSelectAddressesHaveHistoricBalances, [])
  const hasHistoricBalances = useAppSelector((s) => selectAddressesHaveHistoricBalances(s, addressHashes))
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies.USD.ticker, {
    pollingInterval: 60000
  })

  const [hoveredDataPoint, setHoveredDataPoint] = useState<DataPoint>()
  const [chartLength, setChartLength] = useState<ChartLength>('1m')
  const [worthInBeginningOfChart, setWorthInBeginningOfChart] = useState<DataPoint['worth']>()

  const { date, worth } = hoveredDataPoint ?? { date: undefined, worth: undefined }
  const singleAddress = !!addressHash
  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
  const totalAvailableBalance = addresses.reduce((acc, address) => acc + getAvailableBalance(address), BigInt(0))
  const totalLockedBalance = addresses.reduce((acc, address) => acc + BigInt(address.lockedBalance), BigInt(0))
  const totalAmountWorth = calculateAmountWorth(totalBalance, price ?? 0)
  const balanceInFiat = worth ?? totalAmountWorth

  const isOnline = network.status === 'online'
  const isShowingHistoricWorth = !!worth

  return (
    <UnlockedWalletPanelStyled>
      <Panel className={className} worth={worth}>
        <Balances>
          <BalancesRow>
            <BalancesColumn>
              <Today highlighted={!!date}>{date ? dayjs(date).format('DD/MM/YYYY') : t('Value today')}</Today>
              {stateUninitialized || isPriceLoading ? (
                <SkeletonLoader height="46px" />
              ) : (
                <>
                  <FiatTotalAmount tabIndex={0} value={balanceInFiat} isFiat suffix={currencies['USD'].symbol} />
                  <Opacity fadeOut={isShowingHistoricWorth}>
                    <FiatDeltaPercentage>
                      {worthInBeginningOfChart ? (
                        <DeltaPercentage initialValue={worthInBeginningOfChart} latestValue={totalAmountWorth} />
                      ) : (
                        '-%'
                      )}
                    </FiatDeltaPercentage>
                  </Opacity>
                  {hasHistoricBalances && (
                    <ChartLengthBadges>
                      {chartLengths.map((length) => (
                        <ButtonStyled
                          key={length}
                          transparent
                          short
                          isActive={length === chartLength}
                          onClick={() => setChartLength(length)}
                        >
                          {length}
                        </ButtonStyled>
                      ))}
                    </ChartLengthBadges>
                  )}
                </>
              )}
            </BalancesColumn>
            {!singleAddress && (
              <>
                <Divider />
                <AvailableLockedBalancesColumn fadeOut={isShowingHistoricWorth}>
                  <AvailableBalanceRow>
                    <BalanceLabel tabIndex={0} role="representation">
                      {t('Available')}
                    </BalanceLabel>
                    {stateUninitialized ? (
                      <SkeletonLoader height="25.5px" />
                    ) : (
                      <AlphAmount tabIndex={0} value={isOnline ? totalAvailableBalance : undefined} />
                    )}
                  </AvailableBalanceRow>
                  <LockedBalanceRow>
                    <BalanceLabel tabIndex={0} role="representation">
                      {t('Locked')}
                    </BalanceLabel>
                    {stateUninitialized ? (
                      <SkeletonLoader height="25.5px" />
                    ) : (
                      <AlphAmount tabIndex={0} value={isOnline ? totalLockedBalance : undefined} />
                    )}
                  </LockedBalanceRow>
                </AvailableLockedBalancesColumn>
              </>
            )}
          </BalancesRow>
        </Balances>
        {children && <RightColumnContent fadeOut={isShowingHistoricWorth}>{children}</RightColumnContent>}
      </Panel>
      {showChart && (
        <ChartContainer>
          <HistoricWorthChart
            addressHash={addressHash}
            currency={currencies.USD.ticker}
            onDataPointHover={setHoveredDataPoint}
            onWorthInBeginningOfChartChange={setWorthInBeginningOfChart}
            latestWorth={totalAmountWorth}
            length={chartLength}
          />
        </ChartContainer>
      )}
    </UnlockedWalletPanelStyled>
  )
}

export default AmountsOverviewPanel

const UnlockedWalletPanelStyled = styled(UnlockedWalletPanel)`
  position: relative;
`

const Panel = styled.div<{ worth?: number }>`
  display: flex;
  gap: 30px;
  align-items: center;

  margin-bottom: 45px;
  padding: 30px 0;

  ${({ worth }) =>
    !worth &&
    css`
      position: relative;
      z-index: 1;
    `}
`

const Balances = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
`

const BalancesRow = styled.div`
  display: flex;
  padding: 25px;
`

const Opacity = styled.div<{ fadeOut?: boolean }>`
  transition: opacity 0.2s ease-out;
  opacity: ${({ fadeOut }) => (fadeOut ? 0.23 : 1)};
`

const RightColumnContent = styled(Opacity)`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const BalancesColumn = styled(Opacity)`
  flex: 1;
  min-width: 200px;
`

const AvailableLockedBalancesColumn = styled(BalancesColumn)`
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Divider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
  margin: 17px 55px;
`

const AvailableBalanceRow = styled.div`
  margin-bottom: 20px;
`
const LockedBalanceRow = styled.div``

const FiatTotalAmount = styled(Amount)`
  font-size: 32px;
  font-weight: var(--fontWeight-bold);
`

const FiatDeltaPercentage = styled.div`
  font-size: 18px;
  margin-top: 5px;
`

const AlphAmount = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
  font-size: 21px;
  font-weight: var(--fontWeight-semiBold);
`

const BalanceLabel = styled.label`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 12px;
  display: block;
  margin-bottom: 3px;
`

const Today = styled.div<{ highlighted: boolean }>`
  color: ${({ theme, highlighted }) => (highlighted ? theme.font.secondary : theme.font.tertiary)};
  font-size: 16px;
  margin-bottom: 8px;
`

const ChartLengthBadges = styled.div`
  margin-top: 20px;
  display: flex;
  gap: 10px;
`

const ButtonStyled = styled(Button)<{ isActive: boolean }>`
  color: ${({ theme }) => theme.font.primary};
  opacity: ${({ isActive }) => (isActive ? 1 : 0.4)};
  border-color: ${({ theme }) => theme.font.primary};
  padding: 3px;
  height: auto;
  min-width: 32px;
  border-radius: var(--radius-small);
`

const ChartContainer = styled.div`
  position: absolute;
  right: 0;
  left: 0;

  bottom: -50px;
  height: 100px;
`
