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
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useAppSelector } from '@/hooks/redux'
import {
  selectAddressByHash,
  selectAllAddresses,
  selectIsStateUninitialized
} from '@/storage/addresses/addressesSelectors'
import { useGetPriceQuery } from '@/storage/assets/priceApiSlice'
import { getAvailableBalance } from '@/utils/addresses'
import { currencies } from '@/utils/currencies'

interface AmountsOverviewPanelProps {
  isLoading?: boolean
  className?: string
  addressHash?: string
}

const AmountsOverviewPanel: FC<AmountsOverviewPanelProps> = ({ className, addressHash, children }) => {
  const { t } = useTranslation()
  const allAddresses = useAppSelector(selectAllAddresses)
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash ?? ''))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const addresses = address ? [address] : allAddresses
  const network = useAppSelector((s) => s.network)
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies.USD.ticker, {
    pollingInterval: 60000
  })

  const singleAddress = !!address
  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
  const totalAvailableBalance = addresses.reduce((acc, address) => acc + getAvailableBalance(address), BigInt(0))
  const totalLockedBalance = addresses.reduce((acc, address) => acc + BigInt(address.lockedBalance), BigInt(0))
  const balanceInFiat = calculateAmountWorth(totalBalance, price ?? 0)
  const isOnline = network.status === 'online'

  return (
    <div className={className}>
      <Balances>
        <BalancesRow>
          <BalancesColumn>
            <Today>{t('Value today')}</Today>
            {stateUninitialized || isPriceLoading ? (
              <SkeletonLoader height="46px" />
            ) : (
              <FiatTotalAmount tabIndex={0} value={balanceInFiat} isFiat suffix={currencies['USD'].symbol} />
            )}
          </BalancesColumn>
          {!singleAddress && (
            <>
              <Divider />
              <AvailableLockedBalancesColumn>
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
      {children && <RightColumnContent>{children}</RightColumnContent>}
    </div>
  )
}

export default styled(AmountsOverviewPanel)`
  display: flex;
  gap: 30px;
  margin-bottom: 45px;
  padding: 30px 0;
`

const Balances = styled.div`
  flex: 2;
  display: flex;
  align-items: center;
`

const BalancesRow = styled.div`
  display: flex;
  align-items: stretch;
  flex-grow: 1;
  padding: 0 22px;
`

const RightColumnContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const BalancesColumn = styled.div`
  flex: 1;
`

const AvailableLockedBalancesColumn = styled(BalancesColumn)``

const Divider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.primary};
  margin: 17px 55px;
`

const AvailableBalanceRow = styled.div`
  margin-bottom: 20px;
`
const LockedBalanceRow = styled.div``

const FiatTotalAmount = styled(Amount)`
  font-size: 30px;
  font-weight: var(--fontWeight-bold);
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

const Today = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 16px;
  margin-bottom: 8px;
`
