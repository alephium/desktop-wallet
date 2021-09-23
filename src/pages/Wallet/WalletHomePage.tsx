import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { SectionContent, MainPanel } from '../../components/PageComponents'
import { GlobalContext } from '../../App'
import { useHistory } from 'react-router-dom'
import { Transaction } from 'alephium-js/dist/api/api-explorer'
import { Send, QrCode, RefreshCw, Lock, LucideProps, Settings as SettingsIcon } from 'lucide-react'
import { abbreviateAmount, calAmountDelta, openInNewWindow } from '../../utils/misc'
import { loadSettingsOrDefault } from '../../utils/clients'
import AmountBadge from '../../components/Badge'
import _ from 'lodash'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { SimpleTx, WalletContext } from './WalletRootPage'
import { useInterval } from '../../utils/hooks'
import Spinner from '../../components/Spinner'
import { AnimatePresence, motion, useViewportScroll } from 'framer-motion'
import { Button } from '../../components/Buttons'
import { isHTTPError } from '../../utils/api'
import { appHeaderHeight, deviceBreakPoints } from '../../style/globalStyles'
import AppHeader from '../../components/AppHeader'
import Address from '../../components/Address'
import { ReactComponent as AlephiumLogoSVG } from '../../images/alephium_logo_monochrome.svg'

dayjs.extend(relativeTime)

const renderIOAccountList = (currentAddress: string, io: { address?: string }[]) => {
  if (io.length > 0) {
    return _(io.filter((o) => o.address !== currentAddress))
      .map((v) => v.address)
      .uniq()
      .value()
      .map((v) => <Address key={v} hash={v || ''} />)
  } else {
    return <MiningRewardString>Mining Rewards</MiningRewardString>
  }
}

const WalletHomePage = () => {
  const history = useHistory()
  const { wallet, setSnackbarMessage, client, setWallet, currentUsername } = useContext(GlobalContext)
  const [balance, setBalance] = useState<bigint | undefined>(undefined)
  const { pendingTxList, loadedTxList, setLoadedTxList } = useContext(WalletContext)
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
        if (isHTTPError(e)) {
          setSnackbarMessage({ text: e.error.detail, type: 'alert' })
        }
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
  useInterval(fetchData, 2000, pendingTxList.length === 0)

  if (!wallet) return null

  return (
    <WalletContainer>
      <AppHeader>
        <RefreshButton transparent squared onClick={fetchData} disabled={isLoading || pendingTxList.length > 0}>
          {isLoading || pendingTxList.length > 0 ? <Spinner /> : <RefreshCw />}
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
            {(isLoading || pendingTxList.length > 0) && <Spinner size={'16px'} />}
          </LastTransactionListHeader>
          <LastTransactionList>
            {pendingTxList
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

  const IOAddressesList = isOut ? t.outputs : t.inputs

  const { explorerUrl } = loadSettingsOrDefault()

  return (
    <TransactionItemContainer onClick={() => openInNewWindow(`${explorerUrl}/#/transactions/${t.hash}`)}>
      <TxDetails>
        <DirectionLabel>{isOut ? '↑ TO' : '↓ FROM'}</DirectionLabel>
        <IOAddresses>{IOAddressesList && renderIOAccountList(currentAddress, IOAddressesList)}</IOAddresses>
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
  const { explorerUrl } = loadSettingsOrDefault()

  return (
    <PendingTransactionItemContainer onClick={() => openInNewWindow(`${explorerUrl}/#/transactions/${t.txId}`)}>
      <TxDetails>
        <DirectionLabel>TO</DirectionLabel>
        <IOAddresses>
          <Address key={t.toAddress} hash={t.toAddress || ''} />
        </IOAddresses>
        <TxTimestamp>{dayjs().to(t.timestamp)}</TxTimestamp>
      </TxDetails>
      <AmountBadge type="minus" prefix="-" content={t.amount} amount />
    </PendingTransactionItemContainer>
  )
}

// =================
// ==== STYLING ====
// =================

const WalletContainer = styled.div`
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
  margin: 0;

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

const IOAddresses = styled.div`
  display: flex;
  margin-bottom: 5px;
`

const TxAmountContainer = styled.div`
  flex: 0.5;
  display: flex;
  justify-content: flex-end;
`

const MiningRewardString = styled.span`
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

  background: linear-gradient(90deg, #ffffff, rgb(230, 230, 230));
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
    fill: rgba(0, 0, 0, 0.05) !important;
  }

  @media ${deviceBreakPoints.mobile} {
    display: none;
  }
`

export default WalletHomePage
