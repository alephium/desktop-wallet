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

import { Check, Lock } from 'lucide-react'
import styled from 'styled-components'

import { useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import Amount from './Amount'

const AccountSummaryCard = ({ className }: { className?: string }) => {
  const { currentUsername } = useGlobalContext()
  const { addresses } = useAddressesContext()

  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.balance), BigInt(0))
  const totalAvailableBalance = addresses.reduce((acc, address) => acc + address.availableBalance, BigInt(0))
  const totalLockedBalance = addresses.reduce((acc, address) => acc + BigInt(address.details.lockedBalance), BigInt(0))

  return (
    <div className={className}>
      <AmountContainer>
        <AmountStyled value={totalBalance} />
        Total balance
      </AmountContainer>
      <Divider />
      <Balances>
        <Balance>
          <Check size="12px" />
          <span>
            Available: <Amount value={totalAvailableBalance} />
          </span>
        </Balance>
        <BalanceLocked>
          <Lock size="12px" />
          <span>
            Locked: <Amount value={totalLockedBalance} />
          </span>
        </BalanceLocked>
      </Balances>
      <AccountName>{currentUsername}</AccountName>
    </div>
  )
}

export default styled(AccountSummaryCard)`
  border-radius: var(--radius-medium);
  border: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.primary};
  padding: var(--spacing-4);
  width: 300px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.7);
`

const AmountStyled = styled(Amount)`
  font-size: 32px;
  font-weight: var(--fontWeight-medium);
  display: block;
  color: ${({ theme }) => theme.font.primary};
  margin-bottom: 3px;
`

const AmountContainer = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const Divider = styled.div`
  width: 24px;
  height: 1px;
  background-color: ${({ theme }) => theme.border.primary};
  margin: var(--spacing-3) 0;
`

const Balance = styled.div`
  display: flex;
  align-items: center;
  font-weight: var(--fontWeight-medium);
  gap: var(--spacing-1);
`

const Balances = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`

const BalanceLocked = styled(Balance)`
  color: ${({ theme }) => theme.font.secondary};
`

const AccountName = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 10px;
  margin-bottom: -8px;
  text-transform: uppercase;
  text-align: right;
`
