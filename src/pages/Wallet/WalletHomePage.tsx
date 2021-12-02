// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { useHistory } from 'react-router-dom'
import { Input, Output, Transaction } from 'alephium-js/dist/api/api-explorer'
import { Send, QrCode, RefreshCw, Lock, LucideProps, Settings as SettingsIcon } from 'lucide-react'
import _ from 'lodash'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { AnimatePresence, motion, useViewportScroll } from 'framer-motion'

import { GlobalContext } from '../../App'
import { SectionContent, MainPanel } from '../../components/PageComponents'
import AmountBadge from '../../components/Badge'
import Spinner from '../../components/Spinner'
import { Button } from '../../components/Buttons'
import AppHeader, { HeaderDivider } from '../../components/AppHeader'
import Address from '../../components/Address'
import NetworkBadge from '../../components/NetworkBadge'
import { abbreviateAmount, calAmountDelta } from '../../utils/numbers'
import { loadSettings, useCurrentNetwork } from '../../utils/clients'
import { useInterval } from '../../utils/hooks'
import { getHumanReadableError } from '../../utils/api'
import { openInWebBrowser } from '../../utils/misc'
import { SimpleTx, WalletContext } from './WalletRootPage'
import { appHeaderHeight, deviceBreakPoints } from '../../style/globalStyles'

import { ReactComponent as AlephiumLogoSVG } from '../../images/alephium_logo_monochrome.svg'

dayjs.extend(relativeTime)

const WalletHomePage = () => {
  const history = useHistory()
  const currentNetwork = useCurrentNetwork()
  const { wallet, setSnackbarMessage, client, setWallet, currentUsername } = useContext(GlobalContext)
  const [balance, setBalance] = useState<bigint | undefined>(undefined)
  const { networkPendingTxLists, loadedTxList, setLoadedTxList } = useContext(WalletContext)
  const [totalNumberOfTx, setTotalNumberOfTx] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)
  const [lastLoadedPage, setLastLoadedPage] = useState(1)

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
  const fetchData = useCallback(() => {
    setLastLoadedPage(1) // Reload only most recent page

    const getTransactionsAndBalance = async () => {
      setIsLoading(true)
      try {
        if (wallet && client) {
          const addressDetailsResp = await client.explorer.getAddressDetails(wallet.address)
          const addressTransactionsResp = await client.explorer.getAddressTransactions(wallet.address, 1)

          if (addressDetailsResp.data) {
            setBalance(BigInt(addressDetailsResp.data.balance))
            setTotalNumberOfTx(addressDetailsResp.data.txNumber)
          } else return

          // Transactions
          setLoadedTxList(addressTransactionsResp.data)
          setIsLoading(false)
        }
      } catch (e) {
        setIsLoading(false)

        setSnackbarMessage({
          text: getHumanReadableError(e, 'Error while fetching transactions and balance'),
          type: 'alert'
        })
      }
    }

    getTransactionsAndBalance()
  }, [client, setLoadedTxList, setSnackbarMessage, wallet])

  const fetchMore = useCallback(
    (pageToLoad: number) => {
      setLastLoadedPage(pageToLoad)

      const fetchNewPage = async () => {
        try {
          if (wallet && client) {
            const addressTransactionsResp = await client.explorer.getAddressTransactions(wallet.address, pageToLoad)

            if (
              loadedTxList[loadedTxList.length - 1].hash !==
              addressTransactionsResp.data[addressTransactionsResp.data.length - 1].hash
            ) {
              setLoadedTxList([...loadedTxList, ...addressTransactionsResp.data])
            }
          }
        } catch (e) {
          console.log(e)
        }
      }

      fetchNewPage()
    },
    [client, loadedTxList, setLoadedTxList, wallet]
  )

  // Make initial calls
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Polling (when pending tx)
  useInterval(fetchData, 2000, networkPendingTxLists[currentNetwork]?.length === 0)

  if (!wallet) return null

  const pendingTxs = networkPendingTxLists[currentNetwork] || []
  const showSpinner = isLoading || pendingTxs.length > 0

  return (
    <WalletContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
      <AppHeader>
        <NetworkBadge />
        <HeaderDivider />
        <RefreshButton transparent squared onClick={fetchData} disabled={showSpinner}>
          {showSpinner ? <Spinner /> : <RefreshCw />}
        </RefreshButton>
        <SettingsButton transparent squared onClick={() => history.push('/wallet/settings')}>
          <SettingsIcon />
        </SettingsButton>
      </AppHeader>
      <WalletSidebar>
        <WalletAmountContainer>
          <WalletAmountHighlightOverlay />
          <WalletAmountContent>
            <WalletAmount>{balance ? abbreviateAmount(balance) : 0} ℵ</WalletAmount>
            <WalletAmountSubtitle>Total balance</WalletAmountSubtitle>
            <CurrentAccount>Account: {currentUsername}</CurrentAccount>
          </WalletAmountContent>
        </WalletAmountContainer>
        <WalletActions>
          <ActionsTitle>Quick actions</ActionsTitle>
          <WalletActionButton Icon={QrCode} label="Show address" link="/wallet/address" />
          <WalletActionButton Icon={Send} label="Send token" link="/wallet/send" />
          <WalletActionButton Icon={Lock} label="Lock wallet" onClick={() => setWallet(undefined)} />
        </WalletActions>
        <FloatingLogo />
      </WalletSidebar>
      <AnimatePresence>
        {isHeaderCompact && (
          <CompactWalletAmountBoxContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CompactWalletAmountBox>
              <WalletAmountContainer>
                <WalletAmount style={{ scale: 0.7 }}>{balance && abbreviateAmount(balance)}ℵ</WalletAmount>
              </WalletAmountContainer>
            </CompactWalletAmountBox>
          </CompactWalletAmountBoxContainer>
        )}
      </AnimatePresence>
      <TransactionsContainer>
        <MainPanel>
          <LastTransactionListHeader>
            <LastTransactionListTitle>Transactions ({totalNumberOfTx})</LastTransactionListTitle>
            {showSpinner && <Spinner size={'16px'} />}
          </LastTransactionListHeader>
          <LastTransactionList>
            {pendingTxs
              .slice(0)
              .reverse()
              .map((t) => {
                return <PendingTransactionItem key={t.txId} transaction={t} />
              })}
            {loadedTxList &&
              loadedTxList.length > 0 &&
              loadedTxList?.map((t) => {
                return <TransactionItem key={t.hash} transaction={t} currentAddress={wallet.address} />
              })}
          </LastTransactionList>
          {loadedTxList && loadedTxList.length > 0 && loadedTxList.length === totalNumberOfTx ? (
            <NoMoreTransactionMessage>No more transactions</NoMoreTransactionMessage>
          ) : loadedTxList.length === 0 ? (
            <NoMoreTransactionMessage>No transactions yet!</NoMoreTransactionMessage>
          ) : (
            <LoadMoreMessage onClick={() => fetchMore(lastLoadedPage + 1)}>Load more</LoadMoreMessage>
          )}
        </MainPanel>
      </TransactionsContainer>
    </WalletContainer>
  )
}

const IOList = ({
  currentAddress,
  isOut,
  transaction
}: {
  currentAddress: string
  isOut: boolean
  transaction: Transaction
}) => {
  const io = (isOut ? transaction.outputs : transaction.inputs) as Array<Output | Input> | undefined
  const genesisTimestamp = 1231006505000

  if (io && io.length > 0) {
    return io.every((o) => o.address === currentAddress) ? (
      <Address key={currentAddress} hash={currentAddress} />
    ) : (
      <>
        {_(io.filter((o) => o.address !== currentAddress))
          .map((v) => v.address)
          .uniq()
          .value()
          .map((v) => (
            <Address key={v} hash={v || ''} />
          ))}
      </>
    )
  } else if (transaction.timestamp === genesisTimestamp) {
    return <TXSpecialTypeLabel>Genesis TX</TXSpecialTypeLabel>
  } else {
    return <TXSpecialTypeLabel>Mining Rewards</TXSpecialTypeLabel>
  }
}

const WalletActionButton = ({
  Icon,
  label,
  link,
  onClick
}: {
  Icon: (props: LucideProps) => JSX.Element
  label: string
  link?: string
  onClick?: () => void
}) => {
  const theme = useTheme()
  const history = useHistory()

  const handleClick = () => {
    if (link) {
      history.push(link)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <WalletActionButtonContainer onClick={handleClick}>
      <ActionContent>
        <ActionIcon>
          <Icon color={theme.font.primary} size={18} />
        </ActionIcon>
        <ActionLabel>{label}</ActionLabel>
      </ActionContent>
    </WalletActionButtonContainer>
  )
}

const TransactionItem = ({ transaction: t, currentAddress }: { transaction: Transaction; currentAddress: string }) => {
  const amountDelta = calAmountDelta(t, currentAddress)

  const isOut = amountDelta < 0

  const { explorerUrl } = loadSettings()

  return (
    <TransactionItemContainer onClick={() => openInWebBrowser(`${explorerUrl}/#/transactions/${t.hash}`)}>
      <TxDetails>
        <DirectionLabel>{isOut ? '↑ TO' : '↓ FROM'}</DirectionLabel>
        <AddressListContainer>
          <IOList currentAddress={currentAddress} isOut={isOut} transaction={t} />
        </AddressListContainer>
        <TxTimestamp>{dayjs(t.timestamp).format('MM/DD/YYYY HH:mm:ss')}</TxTimestamp>
      </TxDetails>
      <TxAmountContainer>
        <AmountBadge
          type={isOut ? 'minus' : 'plus'}
          prefix={isOut ? '- ' : '+ '}
          content={amountDelta < 0 ? (amountDelta * -1n).toString() : amountDelta.toString()}
          amount
        />
      </TxAmountContainer>
    </TransactionItemContainer>
  )
}

// Transaction that has been sent and waiting to be fetched
const PendingTransactionItem = ({ transaction: t }: { transaction: SimpleTx }) => {
  const { explorerUrl } = loadSettings()

  return (
    <PendingTransactionItemContainer onClick={() => openInWebBrowser(`${explorerUrl}/#/transactions/${t.txId}`)}>
      <TxDetails>
        <DirectionLabel>↑ TO</DirectionLabel>
        <AddressListContainer>
          <Address key={t.toAddress} hash={t.toAddress || ''} />
        </AddressListContainer>
        <TxTimestamp>{dayjs().to(t.timestamp)}</TxTimestamp>
      </TxDetails>
      <AmountBadge type="minus" prefix="-" content={t.amount} amount />
    </PendingTransactionItemContainer>
  )
}

// =================
// ==== STYLING ====
// =================

const WalletContainer = styled(motion.div)`
  display: flex;
  flex: 1;
  overflow: hidden;

  @media ${deviceBreakPoints.mobile} {
    flex-direction: column;
    overflow: initial;
  }
`

const WalletSidebar = styled(SectionContent)`
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
  margin: 5px !important;
  margin-top: calc(${appHeaderHeight} + 5px) !important;
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
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
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
  margin: 25px;
  margin-top: 10px;
  border-radius: 7px;
  background-color: ${({ theme }) => theme.bg.contrast};
  overflow: hidden;

  @media ${deviceBreakPoints.mobile} {
    flex: 1.5;
  }

  &:hover {
    ${WalletAmountHighlightOverlay} {
      opacity: 0.9;
    }
  }
`

const CompactWalletAmountBox = styled(motion.div)`
  background-color: ${({ theme }) => theme.font.primary};
  width: 100%;
  height: 60px;
  padding: 0 25px;
  display: flex;
  align-items: center;
  border-radius: 7px;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);

  ${WalletAmountContainer} {
    margin: 0;
    background: transparent;

    @media ${deviceBreakPoints.mobile} {
      min-height: initial;
    }
  }
`

const WalletAmount = styled(motion.div)`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.font.contrastPrimary};
  text-align: center;
  font-weight: 600;
`

const WalletAmountSubtitle = styled.div`
  margin: 0 auto;
  font-size: 1rem;
  color: ${({ theme }) => theme.font.contrastSecondary};
  text-align: center;
  font-weight: 500;
`

const CurrentAccount = styled.span`
  text-align: center;
  color: ${({ theme }) => theme.font.contrastSecondary};
  margin-top: 5px;
  font-size: 0.95em;
`

const WalletActions = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 25px;
  border-top: 1px solid ${({ theme }) => theme.border.secondary};

  @media ${deviceBreakPoints.mobile} {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const ActionsTitle = styled.h3`
  width: 100%;
`

const ActionIcon = styled.div`
  display: flex;
  margin-right: 15px;
  opacity: 0.5;
  transition: all 0.1s ease-out;
`

const ActionLabel = styled.label`
  color: ${({ theme }) => theme.font.secondary};
  text-align: center;
  transition: all 0.1s ease-out;
`

const WalletActionButtonContainer = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 50px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }

  &:hover {
    cursor: pointer;
    ${ActionLabel} {
      color: ${({ theme }) => theme.global.accent};
    }

    ${ActionIcon} {
      opacity: 1;
    }
  }
`

const RefreshButton = styled(Button)``

const SettingsButton = styled(Button)``

const ActionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  * {
    cursor: pointer;
  }
`

// === TRANSACTION === //

const TransactionsContainer = styled.div`
  flex: 1;
  overflow: auto;
  flex-direction: column;
  justify-content: center;
  padding: 25px;
  padding-top: calc(10px + ${appHeaderHeight});

  @media ${deviceBreakPoints.mobile} {
    overflow: initial;
    padding: 0;
  }
`

const LastTransactionListHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`

const LastTransactionListTitle = styled.h2`
  margin: 0 15px 0 0;

  @media ${deviceBreakPoints.mobile} {
    margin-left: 0;
  }
`

const LastTransactionList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const TransactionItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 5px;
  cursor: pointer;
  transition: all 0.1s ease-out;

  &:hover {
    background-color: ${({ theme }) => theme.bg.hover};
  }

  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};

  @media ${deviceBreakPoints.mobile} {
    padding: 15px 0;
  }
`

const TxDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  line-height: 16px;
`

const DirectionLabel = styled.span`
  font-size: 0.9em;
  font-weight: 600;
  margin-bottom: 5px;
`

const AddressListContainer = styled.div`
  display: flex;
  margin-bottom: 5px;
`

const TxAmountContainer = styled.div`
  flex: 0.5;
  display: flex;
  justify-content: flex-end;
`

const TXSpecialTypeLabel = styled.span`
  align-self: flex-start;
  color: ${({ theme }) => theme.font.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 3px 6px;
  margin: 3px 0;
  border-radius: 4px;
  font-style: italic;
`

const TxTimestamp = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 0.9em;
`

const PendingTransactionItemContainer = styled(TransactionItemContainer)`
  opacity: 0.5;

  background: linear-gradient(90deg, rgba(200, 200, 200, 0.4), rgba(200, 200, 200, 0.05));
  background-size: 400% 400%;
  animation: gradient 2s ease infinite;

  @keyframes gradient {
    0% {
      background-position: 0% 50%;
    }
    25% {
      background-position: 100% 50%;
    }
    75% {
      background-position: 25% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`

const LoadMoreMessage = styled.div`
  color: ${({ theme }) => theme.global.accent};
  cursor: pointer;
  align-self: center;
  margin-top: 15px;
  margin-bottom: 15px;
`

const NoMoreTransactionMessage = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  text-align: center;
  width: 100%;
  margin-top: 15px;
`

const FloatingLogo = styled(AlephiumLogoSVG)`
  position: absolute;
  bottom: 25px;
  left: 25px;
  width: 40px;
  height: 60px;

  path {
    fill: ${({ theme }) =>
      theme.name === 'light' ? 'rgba(0, 0, 0, 0.08) !important' : 'rgba(255, 255, 255, 0.03) !important'};
  }

  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`

export default WalletHomePage
