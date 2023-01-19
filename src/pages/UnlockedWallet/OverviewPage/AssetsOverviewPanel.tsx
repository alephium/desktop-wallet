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
import classNames from 'classnames'
import { ArrowDown, ArrowUp, Lock, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import Button from '@/components/Button'
import { useAddressesContext } from '@/contexts/addresses'
import { useGlobalContext } from '@/contexts/global'
import { useAppSelector } from '@/hooks/redux'
import { useGetPriceQuery } from '@/store/priceApiSlice'
import { currencies } from '@/utils/currencies'

interface AssetsOverviewProps {
  isLoading?: boolean
  className?: string
}

const AssetsOverview = ({ className, isLoading }: AssetsOverviewProps) => {
  const { t } = useTranslation()
  const { addresses } = useAddressesContext()
  const { networkStatus } = useGlobalContext()
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies.USD.ticker, {
    pollingInterval: 60000
  })

  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.balance), BigInt(0))
  const totalAvailableBalance = addresses.reduce((acc, address) => acc + address.availableBalance, BigInt(0))
  const totalLockedBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.lockedBalance), BigInt(0))
  const balanceInFiat = convertSetToFiat(totalBalance, price ?? 0)
  const isOnline = networkStatus === 'online'

  return (
    <div className={classNames(className, { 'skeleton-loader': isLoading || isPriceLoading })}>
      <BalancesSection>
        <DataRow>
          <DataRowColumn>
            <WalletName>{activeWallet.name}</WalletName>
            {!isPriceLoading && (
              <FiatTotalAmount tabIndex={0} value={balanceInFiat} isFiat suffix={currencies['USD'].symbol} />
            )}
          </DataRowColumn>
          <Divider />
          <DataRowColumn>
            <AvailableBalanceRow>
              <BalanceLabel tabIndex={0} role="representation">
                {t('Available')}
              </BalanceLabel>
              <AlphAmount tabIndex={0} value={isOnline ? totalAvailableBalance : undefined} />
            </AvailableBalanceRow>
            <LockedBalanceRow>
              <BalanceLabel tabIndex={0} role="representation">
                {t('Locked')}
              </BalanceLabel>
              <AlphAmount tabIndex={0} value={isOnline ? totalLockedBalance : undefined} />
            </LockedBalanceRow>
          </DataRowColumn>
        </DataRow>
        <ButtonsRow>
          <BottomButton transparent borderless>
            <ArrowDown />
            <ButtonText>{t('Receive')}</ButtonText>
          </BottomButton>
          <BottomButton transparent borderless>
            <ArrowUp />
            <ButtonText>{t('Send')}</ButtonText>
          </BottomButton>
          <BottomButton transparent borderless>
            <Settings />
            <ButtonText>{t('Settings')}</ButtonText>
          </BottomButton>
          <BottomButtonStyled transparent borderless>
            <Lock />
            <ButtonText>{t('Lock wallet')}</ButtonText>
          </BottomButtonStyled>
        </ButtonsRow>
      </BalancesSection>
      <PriceChartSection></PriceChartSection>
    </div>
  )
}

export default styled(AssetsOverview)`
  display: flex;
  border-radius: var(--radius-huge);
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
  margin-bottom: 45px;
  overflow: hidden;
  box-shadow: 0px 2px 20px rgba(0, 0, 0, 0.3); // TODO: Add in theme?
`

const Section = styled.div`
  width: 50%;
`

const BalancesSection = styled(Section)``

const PriceChartSection = styled(Section)`
  border-left: 1px solid ${({ theme }) => theme.border.secondary};
`

const DataRow = styled.div`
  display: flex;
  align-items: stretch;
`

const ButtonsRow = styled.div`
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
`

const DataRowColumn = styled.div`
  flex: 1;
  padding: 30px 40px;
`

const Divider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
  margin: 17px 0;
`

const WalletName = styled.div`
  color: ${({ theme }) => theme.font.secondary}
  font-size: 14px;
  font-weight: var(--fontWeight-medium);
  margin-bottom: 25px;
`

const AvailableBalanceRow = styled.div`
  margin-bottom: 20px;
`
const LockedBalanceRow = styled.div``

const FiatTotalAmount = styled(Amount)`
  font-size: 32px;
  font-weight: var(--fontWeight-bold);
  color: ${({ theme }) => theme.font.primary};
`

const AlphAmount = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
  font-size: 21px;
  font-weight: var(--fontWeight-semiBold);
`

const BalanceLabel = styled.label`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
  display: block;
  margin-bottom: 3px;
`

const BottomButton = styled(Button)`
  border-radius: 0;
  height: 90px;
  margin: 0;
  flex-direction: column;
  border-top: 1px solid ${({ theme }) => theme.border.secondary};
  border-right: 1px solid ${({ theme }) => theme.border.secondary};
`

const ButtonText = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
  margin-top: 7px;
`

const BottomButtonStyled = styled(BottomButton)`
  border-right: 0;
`
