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

import { calculateAmountWorth } from '@alephium/sdk'
import { ArrowDown, ArrowUp, Lock, Settings } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import Box from '@/components/Box'
import Button from '@/components/Button'
import { TableHeader } from '@/components/Table'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import AddressOptionsModal from '@/modals/AddressOptionsModal'
import ModalPortal from '@/modals/ModalPortal'
import ReceiveModal from '@/modals/ReceiveModal'
import SendModalTransfer from '@/modals/SendModals/SendModalTransfer'
import SettingsModal from '@/modals/SettingsModal'
import { walletLocked } from '@/storage/app-state/slices/activeWalletSlice'
import { selectAddressByHash, selectAllAddresses } from '@/storage/app-state/slices/addressesSlice'
import { useGetPriceQuery } from '@/storage/app-state/slices/priceApiSlice'
import { getAvailableBalance } from '@/utils/addresses'
import { currencies } from '@/utils/currencies'

interface AmountsOverviewPanelProps {
  isLoading?: boolean
  className?: string
  addressHash?: string
}

const AmountsOverviewPanel = ({ className, isLoading, addressHash }: AmountsOverviewPanelProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const allAddresses = useAppSelector(selectAllAddresses)
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash ?? ''))
  const addresses = address ? [address] : allAddresses
  const network = useAppSelector((s) => s.network)
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies.USD.ticker, {
    pollingInterval: 60000
  })

  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)
  const [isAddressOptionsModalOpen, setIsAddressOptionsModalOpen] = useState(false)

  const singleAddress = !!address
  const totalBalance = addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
  const totalAvailableBalance = addresses.reduce((acc, address) => acc + getAvailableBalance(address), BigInt(0))
  const totalLockedBalance = addresses.reduce((acc, address) => acc + BigInt(address.lockedBalance), BigInt(0))
  const balanceInFiat = calculateAmountWorth(totalBalance, price ?? 0)
  const isOnline = network.status === 'online'

  const lockWallet = () => dispatch(walletLocked())

  return (
    <div className={className}>
      <Balances>
        <BalancesRow>
          <BalancesColumn>
            <Today>{t('Value today')}</Today>
            {!isPriceLoading && (
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
                  <AlphAmount tabIndex={0} value={isOnline ? totalAvailableBalance : undefined} />
                </AvailableBalanceRow>
                <LockedBalanceRow>
                  <BalanceLabel tabIndex={0} role="representation">
                    {t('Locked')}
                  </BalanceLabel>
                  <AlphAmount tabIndex={0} value={isOnline ? totalLockedBalance : undefined} />
                </LockedBalanceRow>
              </AvailableLockedBalancesColumn>
            </>
          )}
        </BalancesRow>
      </Balances>
      <Shortcuts>
        <ShortcutsHeader title={t('Shortcuts')} />
        <ButtonsGrid>
          <ShortcutButton
            transparent
            borderless
            onClick={() => setIsReceiveModalOpen(true)}
            Icon={ArrowDown}
            iconColor={theme.global.valid}
          >
            <ButtonText>{t('Receive')}</ButtonText>
          </ShortcutButton>
          <ShortcutButton
            transparent
            borderless
            onClick={() => (singleAddress ? setIsAddressOptionsModalOpen(true) : setIsSettingsModalOpen(true))}
            Icon={Settings}
          >
            <ButtonText>{t(singleAddress ? 'Address settings' : 'Settings')}</ButtonText>
          </ShortcutButton>
          <ShortcutButton
            transparent
            borderless
            onClick={() => setIsSendModalOpen(true)}
            Icon={ArrowUp}
            iconColor={theme.global.accent}
          >
            <ButtonText>{t('Send')}</ButtonText>
          </ShortcutButton>

          <ShortcutButton transparent borderless onClick={lockWallet} Icon={Lock}>
            <ButtonText>{t('Lock wallet')}</ButtonText>
          </ShortcutButton>
        </ButtonsGrid>
      </Shortcuts>
      <ModalPortal>
        {isSendModalOpen && (
          <SendModalTransfer initialTxData={{ fromAddress: address }} onClose={() => setIsSendModalOpen(false)} />
        )}
        {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
        {isReceiveModalOpen && (
          <ReceiveModal addressHash={address?.hash} onClose={() => setIsReceiveModalOpen(false)} />
        )}
        {isAddressOptionsModalOpen && address && (
          <AddressOptionsModal address={address} onClose={() => setIsAddressOptionsModalOpen(false)} />
        )}
      </ModalPortal>
    </div>
  )
}

export default styled(AmountsOverviewPanel)`
  display: flex;
  gap: 30px;
  margin-bottom: 45px;
  padding: 36px 0;
`

const Balances = styled.div`
  flex: 2;
`

const BalancesRow = styled.div`
  display: flex;
  align-items: stretch;
  flex-grow: 1;
  padding: 0 22px;
`

const Shortcuts = styled(Box)`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background-color: ${({ theme }) => theme.border.primary};
`

const ShortcutsHeader = styled(TableHeader)`
  height: 50px;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
`

const ShortcutButton = styled(Button)`
  border-radius: 0;
  margin: 0;
  width: auto;
  background-color: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.font.primary};
`

const BalancesColumn = styled.div`
  flex: 1;
`

const AvailableLockedBalancesColumn = styled(BalancesColumn)`
  padding-left: 55px;
`

const Divider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.primary};
  margin: 17px 0;
`

const AvailableBalanceRow = styled.div`
  margin-bottom: 20px;
`
const LockedBalanceRow = styled.div``

const FiatTotalAmount = styled(Amount)`
  font-size: 38px;
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

const ButtonText = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
`

const Today = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 16px;
  margin-bottom: 8px;
`
