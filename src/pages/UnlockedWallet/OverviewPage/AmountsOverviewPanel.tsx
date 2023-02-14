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
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import Button from '@/components/Button'
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
  const allAddresses = useAppSelector(selectAllAddresses)
  const address = useAppSelector((state) => selectAddressByHash(state, addressHash ?? ''))
  const addresses = address ? [address] : allAddresses
  const [activeWallet, network] = useAppSelector((s) => [s.activeWallet, s.network])
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
  const balanceInFiat = convertSetToFiat(totalBalance, price ?? 0)
  const isOnline = network.status === 'online'

  const lockWallet = () => dispatch(walletLocked())

  return (
    <div className={classNames(className, { 'skeleton-loader': isLoading || isPriceLoading })}>
      <Balances>
        {!singleAddress && (
          <WalletNameRow>
            <WalletName>{activeWallet.name}</WalletName>
          </WalletNameRow>
        )}
        <BalancesRow>
          <BalancesColumn>
            {!isPriceLoading && (
              <FiatTotalAmount tabIndex={0} value={balanceInFiat} isFiat suffix={currencies['USD'].symbol} />
            )}
            <Today>{t('Today')}</Today>
          </BalancesColumn>
          {!singleAddress && (
            <>
              <Divider />
              <BalancesColumn>
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
              </BalancesColumn>
            </>
          )}
        </BalancesRow>
      </Balances>
      <Buttons>
        <ShortcutButton transparent borderless onClick={() => setIsReceiveModalOpen(true)} Icon={ArrowDown}>
          <ButtonText>{t('Receive')}</ButtonText>
        </ShortcutButton>
        <ShortcutButton transparent borderless onClick={() => setIsSendModalOpen(true)} Icon={ArrowUp}>
          <ButtonText>{t('Send')}</ButtonText>
        </ShortcutButton>
        <ShortcutButton
          transparent
          borderless
          onClick={() => (singleAddress ? setIsAddressOptionsModalOpen(true) : setIsSettingsModalOpen(true))}
          Icon={Settings}
        >
          <ButtonText>{t(singleAddress ? 'Address settings' : 'Settings')}</ButtonText>
        </ShortcutButton>
        {!singleAddress && (
          <ShortcutButton transparent borderless onClick={lockWallet} Icon={Lock}>
            <ButtonText>{t('Lock wallet')}</ButtonText>
          </ShortcutButton>
        )}
      </Buttons>
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
  border-radius: var(--radius-huge);
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.background1};
  margin-bottom: 45px;
  overflow: hidden;
  box-shadow: 0px 2px 20px rgba(0, 0, 0, 0.3); // TODO: Add in theme?
`

const Balances = styled.div`
  flex-grow: 1;
  padding-top: 25px;
`
const WalletNameRow = styled.div`
  padding: 0 40px 25px 40px;
`

const BalancesRow = styled.div`
  display: flex;
  align-items: stretch;
  flex-grow: 1;
`

const Buttons = styled.div`
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  flex-direction: column;
  border-left: 1px solid ${({ theme }) => theme.border.primary};
`

const BalancesColumn = styled.div`
  flex: 1;
  padding-left: 40px;
`

const Divider = styled.div`
  width: 1px;
  background-color: ${({ theme }) => theme.border.primary};
  margin: 17px 0;
`

const WalletName = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
  font-weight: var(--fontWeight-medium);
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

const ShortcutButton = styled(Button)`
  border-radius: 0;
  margin: 0;
  padding: 20px 25px;
  min-width: 200px;
  justify-content: flex-start;
  height: auto;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const ButtonText = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
`

const Today = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
  margin-top: 6px;
`
