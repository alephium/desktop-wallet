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

import { Transaction } from 'alephium-js/dist/api/api-explorer'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AnimatePresence, motion, useViewportScroll } from 'framer-motion'
import { Lock, QrCode, RefreshCw, Send } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'

import ActionButton from '../../components/ActionButton'
import Amount from '../../components/Amount'
import AppHeader from '../../components/AppHeader'
import Button from '../../components/Button'
import FloatingLogo from '../../components/FloatingLogo'
import { FloatingPanel, Section } from '../../components/PageComponents/PageContainers'
import Spinner from '../../components/Spinner'
import TransactionItem from '../../components/TransactionItem'
import { useGlobalContext } from '../../contexts/global'
import { SimpleTx, useTransactionsContext } from '../../contexts/transactions'
import { appHeaderHeight, deviceBreakPoints } from '../../style/globalStyles'
import { getHumanReadableError } from '../../utils/api'
import { txTypes } from '../../utils/constants'
import { useInterval } from '../../utils/hooks'
import { calAmountDelta } from '../../utils/numbers'
import { loadStoredSettings } from '../../utils/settings'

dayjs.extend(relativeTime)

const WalletHomePage = () => {
  const history = useHistory()
  const { wallet, setSnackbarMessage, client, lockWallet, currentUsername, currentNetwork } = useGlobalContext()
  const [balance, setBalance] = useState<bigint | undefined>(undefined)
  const [lockedBalance, setLockedBalance] = useState<bigint>(BigInt(0))
  const { networkPendingTxLists, loadedTxList, setLoadedTxList } = useTransactionsContext()
  const [totalNumberOfTx, setTotalNumberOfTx] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const [lastLoadedPage, setLastLoadedPage] = useState(1)

  const {
    network: { explorerUrl }
  } = loadStoredSettings()

  // Animation related to scroll
  const { scrollY } = useViewportScroll()

  useEffect(() => {
    return scrollY.onChange((y) => {
      if (y >= 200 && !isHeaderCompact) {
        setIsHeaderCompact(true)
      } else if (y < 200 && isHeaderCompact) {
        setIsHeaderCompact(false)
      }
    })
  }, [isHeaderCompact, scrollY])

  // Fetching data
  const fetchBalanceAndLatestTransactions = useCallback(() => {
    const page = 1
    setLastLoadedPage(page) // Reload only most recent page

    const getTransactionsAndBalance = async () => {
      if (wallet && client) {
        setIsLoading(true)
        try {
          const addressDetailsResp = await client.explorer.getAddressDetails(wallet.address)
          const addressTransactionsResp = await client.explorer.getAddressTransactions(wallet.address, page)

          if (!addressDetailsResp.data) return

          setBalance(BigInt(addressDetailsResp.data.balance))
          if (addressDetailsResp.data.lockedBalance) setLockedBalance(BigInt(addressDetailsResp.data.lockedBalance))
          setTotalNumberOfTx(addressDetailsResp.data.txNumber)
          setLoadedTxList(addressTransactionsResp.data)
          setIsLoading(false)
        } catch (e) {
          setIsLoading(false)

          setSnackbarMessage({
            text: getHumanReadableError(e, 'Error while fetching transactions and balance'),
            type: 'alert'
          })
        }
      }
    }

    getTransactionsAndBalance()
  }, [client, setLoadedTxList, setSnackbarMessage, wallet])

  const fetchTransactionsByPage = useCallback(
    (pageToLoad: number) => {
      setLastLoadedPage(pageToLoad)

      const fetchNewPage = async () => {
        try {
          if (wallet && client) {
            const addressTransactionsResp = await client.explorer.getAddressTransactions(wallet.address, pageToLoad)

            if (
              loadedTxList.length > 0 &&
              addressTransactionsResp.data.length > 0 &&
              loadedTxList[loadedTxList.length - 1].hash !==
                addressTransactionsResp.data[addressTransactionsResp.data.length - 1].hash
            ) {
              setLoadedTxList([...loadedTxList, ...addressTransactionsResp.data])
            }
          }
        } catch (e) {
          console.log(e)

          setSnackbarMessage({
            text: getHumanReadableError(e, `Error while fetching transactions of page ${pageToLoad}`),
            type: 'alert'
          })
        }
      }

      fetchNewPage()
    },
    [client, loadedTxList, setLoadedTxList, setSnackbarMessage, wallet]
  )

  // Make initial calls
  useEffect(() => {
    fetchBalanceAndLatestTransactions()
  }, [fetchBalanceAndLatestTransactions])

  // Polling (when pending tx)
  useInterval(fetchBalanceAndLatestTransactions, 2000, networkPendingTxLists[currentNetwork]?.length === 0)

  if (!wallet) return null

  const pendingTxs = networkPendingTxLists[currentNetwork] || []
  const showSpinner = isLoading || pendingTxs.length > 0
  const transactionsHaveLoaded = loadedTxList && loadedTxList.length > 0
  const somePendingConsolidationTxs = pendingTxs.some((tx: SimpleTx) => tx.type === txTypes.CONSOLIDATION)

  return (
    <WalletContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <AppHeader onSettingsClick={() => history.push('/wallet/settings')}>
        <RefreshButton
          transparent
          squared
          onClick={fetchBalanceAndLatestTransactions}
          disabled={showSpinner}
          aria-label="Refresh"
        >
          {showSpinner ? <Spinner /> : <RefreshCw />}
        </RefreshButton>
      </AppHeader>
      <WalletSidebar>
        <WalletAmountContainer>
          <WalletAmountHighlightOverlay />
          <WalletAmountContent>
            <WalletAmount value={balance} />
            <WalletAmountSubtitle>Total balance</WalletAmountSubtitle>
            {lockedBalance > 0 && (
              <LockedBalance>
                <LockedBalanceIcon /> <Amount value={lockedBalance} />
              </LockedBalance>
            )}
            <CurrentAccount>Account: {currentUsername}</CurrentAccount>
          </WalletAmountContent>
        </WalletAmountContainer>
        <WalletActions>
          <ActionsTitle>Quick actions</ActionsTitle>
          <ActionButton Icon={QrCode} label="Show address" link="/wallet/address" />
          {!somePendingConsolidationTxs ? (
            <ActionButton Icon={Send} label="Send token" link="/wallet/send" />
          ) : (
            <ActionButton
              Icon={Send}
              label="Send token"
              onClick={() =>
                setSnackbarMessage({
                  text: 'Please wait until your pending consolidation transactions are confirmed',
                  type: 'alert'
                })
              }
            />
          )}

          <ActionButton Icon={Lock} label="Lock account" onClick={lockWallet} />
        </WalletActions>
        <FloatingLogo position="bottom" />
      </WalletSidebar>
      <AnimatePresence>
        {isHeaderCompact && (
          <CompactWalletAmountBoxContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CompactWalletAmountBox>
              <WalletAmountContainer style={{ scale: 0.7 }}>
                <WalletAmount value={balance} />
              </WalletAmountContainer>
            </CompactWalletAmountBox>
          </CompactWalletAmountBoxContainer>
        )}
      </AnimatePresence>
      <TransactionsContainer>
        <FloatingPanel>
          <LastTransactionListHeader>
            <LastTransactionListTitle>Transactions ({totalNumberOfTx})</LastTransactionListTitle>
            {showSpinner && <Spinner size={'16px'} />}
          </LastTransactionListHeader>
          <LastTransactionList>
            {pendingTxs
              .slice(0)
              .reverse()
              .map((t: SimpleTx) => {
                return (
                  <TransactionItem
                    pending
                    key={t.txId}
                    txUrl={`${explorerUrl}/#/transactions/${t.txId}`}
                    address={t.toAddress}
                    timestamp={t.timestamp}
                    amount={t.amount}
                    type={t.type}
                  />
                )
              })}
            {transactionsHaveLoaded &&
              loadedTxList.map((t: Transaction) => {
                const amountDelta = calAmountDelta(t, wallet.address)
                return (
                  <TransactionItem
                    key={t.hash}
                    txUrl={`${explorerUrl}/#/transactions/${t.hash}`}
                    address={wallet.address}
                    amount={amountDelta}
                    inputs={t.inputs}
                    outputs={t.outputs}
                    timestamp={t.timestamp}
                  />
                )
              })}
          </LastTransactionList>
          {transactionsHaveLoaded && loadedTxList.length === totalNumberOfTx ? (
            <NoMoreTransactionMessage>No more transactions</NoMoreTransactionMessage>
          ) : loadedTxList.length === 0 ? (
            <NoMoreTransactionMessage>No transactions yet!</NoMoreTransactionMessage>
          ) : (
            <LoadMoreMessage onClick={() => fetchTransactionsByPage(lastLoadedPage + 1)}>Load more</LoadMoreMessage>
          )}
        </FloatingPanel>
      </TransactionsContainer>
    </WalletContainer>
  )
}

const WalletContainer = styled(motion.div)`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
    overflow: initial;
  }
`

const WalletSidebar = styled(Section)`
  align-items: stretch;
  justify-content: flex-start;
  flex: 1;
  max-width: 400px;
  position: relative;
  border-right: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
  padding-top: ${appHeaderHeight};

  @media ${deviceBreakPoints.mobile} {
    flex: 0;
    max-width: inherit;
    border: none;
  }
`

const CompactWalletAmountBoxContainer = styled(motion.div)`
  align-items: flex-start;
  justify-content: flex-start;
  margin: var(--spacing-1) !important;
  margin-top: calc(${appHeaderHeight} + var(--spacing-1)) !important;
  flex: 0;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
  display: none;

  @media ${deviceBreakPoints.mobile} {
    display: block;
  }
`

const WalletAmountContent = styled.div`
  position: relative;
  height: 100%;
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  z-index: 1;
`

const WalletAmountHighlightOverlay = styled.div`
  background: ${({ theme }) => theme.global.highlightGradient};
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 0;

  opacity: 0.7;

  transition: all 0.15s ease-out;
`

const WalletAmountContainer = styled.div`
  position: relative;
  min-height: 150px;
  margin: var(--spacing-5);
  margin-top: var(--spacing-2);
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.bg.contrast};
  overflow: hidden;

  &:hover {
    ${WalletAmountHighlightOverlay} {
      opacity: 0.9;
    }
  }
`

const CompactWalletAmountBox = styled(motion.div)`
  background: ${({ theme }) => theme.global.highlightGradient};
  width: 100%;
  height: 60px;
  padding: 0 var(--spacing-5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  box-shadow: 0 10px 10px var(--color-shadow-10);

  ${WalletAmountContainer} {
    margin: 0;
    background: transparent;

    @media ${deviceBreakPoints.mobile} {
      min-height: initial;
    }
  }
`

const WalletAmount = styled(Amount)`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.font.contrastPrimary};
  text-align: center;
  font-weight: var(--fontWeight-semiBold);
`

const WalletAmountSubtitle = styled.div`
  margin: 0 auto;
  font-size: 1rem;
  color: ${({ theme }) => theme.font.contrastSecondary};
  text-align: center;
  font-weight: var(--fontWeight-medium);
`

const CurrentAccount = styled.span`
  text-align: center;
  color: ${({ theme }) => theme.font.contrastSecondary};
  margin-top: var(--spacing-2);
  font-size: 0.95em;
`

const WalletActions = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 var(--spacing-5);
  border-top: 1px solid ${({ theme }) => theme.border.secondary};

  @media ${deviceBreakPoints.mobile} {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const ActionsTitle = styled.h3`
  width: 100%;
`

const RefreshButton = styled(Button)``

// === TRANSACTION === //

const TransactionsContainer = styled.div`
  flex: 1;
  overflow: auto;
  flex-direction: column;
  justify-content: center;
  padding: var(--spacing-5);
  padding-top: calc(10px + ${appHeaderHeight});

  @media ${deviceBreakPoints.mobile} {
    overflow: initial;
    padding: 0;
  }
`

const LastTransactionListHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-3);
`

const LastTransactionListTitle = styled.h2`
  margin: 0 var(--spacing-3) 0 0;

  @media ${deviceBreakPoints.mobile} {
    margin-left: 0;
  }
`

const LastTransactionList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const LoadMoreMessage = styled.div`
  color: ${({ theme }) => theme.global.accent};
  cursor: pointer;
  align-self: center;
  margin-top: var(--spacing-3);
  margin-bottom: var(--spacing-3);
`

const NoMoreTransactionMessage = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  text-align: center;
  width: 100%;
  margin-top: var(--spacing-3);
`

const LockedBalance = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.contrastSecondary};
  margin-top: var(--spacing-2);
  font-weight: var(--fontWeight-medium);
  font-size: 1rem;
`

const LockedBalanceIcon = styled(Lock)`
  height: 1rem;
`

export default WalletHomePage
