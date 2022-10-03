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

import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import Amount from './Amount'

interface WalletSummaryCardProps {
  isLoading?: boolean
  className?: string
}

const WalletSummaryCard = ({ className, isLoading }: WalletSummaryCardProps) => {
  const { t } = useTranslation('App')
  const { addresses } = useAddressesContext()
  const { networkStatus } = useGlobalContext()

  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.balance), BigInt(0))
  const totalAvailableBalance = addresses.reduce((acc, address) => acc + address.availableBalance, BigInt(0))
  const totalLockedBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.lockedBalance), BigInt(0))
  const isOffline = networkStatus === 'offline'

  return (
    <div className={classNames(className, { 'skeleton-loader': isLoading })}>
      <div>
        <AmountStyled tabIndex={0} value={isOffline ? undefined : totalBalance} />
        <BalanceLabel tabIndex={0} role="representation">{t`TOTAL BALANCE`}</BalanceLabel>
      </div>
      <Divider />
      <Balances>
        <Balance>
          <Amount tabIndex={0} value={isOffline ? undefined : totalAvailableBalance} />
          <BalanceLabel tabIndex={0} role="representation">{t`AVAILABLE`}</BalanceLabel>
        </Balance>
        <Balance>
          <Amount tabIndex={0} value={isOffline ? undefined : totalLockedBalance} />
          <BalanceLabel tabIndex={0} role="representation">{t`LOCKED`}</BalanceLabel>
        </Balance>
      </Balances>
    </div>
  )
}

export default styled(WalletSummaryCard)`
  border-radius: var(--radius-medium);
  border: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.primary};
  padding: var(--spacing-4);
  width: 300px;
  box-shadow: ${({ theme }) => theme.shadow.tertiary};
`

const AmountStyled = styled(Amount)`
  font-size: 32px;
  font-weight: var(--fontWeight-medium);
  display: block;
  color: ${({ theme }) => theme.font.primary};
  margin-bottom: 3px;
`

const Divider = styled.div`
  width: 24px;
  height: 2px;
  background-color: ${({ theme }) => theme.border.primary};
  margin: var(--spacing-3) 0;
`

const Balance = styled.div`
  display: flex;
  flex-direction: column;
  font-weight: var(--fontWeight-medium);
  font-size: large;
  gap: var(--spacing-1);
`

const Balances = styled.div`
  display: flex;
  gap: var(--spacing-5);
`

const BalanceLabel = styled.label`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 11px;
`
