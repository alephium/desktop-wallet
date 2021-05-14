import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { PageContainer, SectionContent } from '../../components/PageComponents'
import { GlobalContext } from '../../App'
import { Link } from 'react-router-dom'
import { Transaction } from 'alf-client/dist/api/api-explorer'
import { Send, QrCode, RefreshCw, LucideProps } from 'lucide-react'
import tinycolor from 'tinycolor2'
import { abbreviateAmount, calAmountDelta, openInNewWindow, truncate } from '../../utils/util'
import { loadSettingsOrDefault } from '../../utils/clients'
import mountains from '../../images/mountain.svg'
import AmountBadge from '../../components/Badge'
import _ from 'lodash'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { SimpleTx, WalletContext } from './WalletRootPage'
import { useInterval } from '../../utils/hooks'
import Spinner from '../../components/Spinner'
import { AnimatePresence, motion, useViewportScroll } from 'framer-motion'
import { Button } from '../../components/Buttons'

dayjs.extend(relativeTime)

const renderIOAccountList = (currentAddress: string, io: { address?: string }[]) => {
  return _(io.filter((o) => o.address !== currentAddress))
    .map((v) => v.address)
    .uniq()
    .value()
    .map((v) => <Address key={v}>{truncate(v || '')}</Address>)
}

const WalletHomePage = () => {
  const { wallet, setSnackbarMessage, client } = useContext(GlobalContext)
  const [balance, setBalance] = useState<number | undefined>(undefined)
  const { pendingTxList, loadedTxList, setLoadedTxList } = useContext(WalletContext)
  const [isLoading, setIsLoading] = useState(false)
  const [isHeaderCompact, setIsHeaderCompact] = useState(false)

  // Animation related to scroll
  const { scrollY } = useViewportScroll()

  useEffect(() => {
    return scrollY.onChange((y) => {
      if (y >= 300 && !isHeaderCompact) {
        setIsHeaderCompact(true)
      } else if (y < 300 && isHeaderCompact) {
        setIsHeaderCompact(false)
      }
    })
  }, [isHeaderCompact, scrollY])

  // Fetching data
  const fetchData = useCallback(() => {
    const getTransactionsAndBalance = async () => {
      setIsLoading(true)
      try {
        if (wallet && client) {
          const addressDetails = await client.explorer.getAddressDetails(wallet.address)

          if (addressDetails.balance) {
            setBalance(addressDetails.balance)
          }

          // Transactions
          if (addressDetails.transactions) {
            setLoadedTxList(addressDetails.transactions)
          }
          setIsLoading(false)
        }
      } catch (e) {
        setIsLoading(false)
        console.log(e)
        setSnackbarMessage({
          text: 'Something went wrong when fetching transactions and balance.',
          type: 'alert'
        })
      }
    }

    getTransactionsAndBalance()
  }, [client, setLoadedTxList, setSnackbarMessage, wallet])

  // Make initial calls
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Polling (when pending tx)
  useInterval(fetchData, 2000, pendingTxList.length === 0)

  if (!wallet) return null

  return (
    <PageContainer>
      <WalletAmountBoxContainer>
        <RefreshButton transparent squared onClick={fetchData} disabled={isLoading || pendingTxList.length > 0}>
          {isLoading || pendingTxList.length > 0 ? <Spinner /> : <RefreshCw />}
        </RefreshButton>
        <WalletAmountBox>
          <WalletAmountContainer>
            <WalletAmount>{balance && abbreviateAmount(balance)}ℵ</WalletAmount>
            <WalletFullAmount>{balance}ℵ</WalletFullAmount>
          </WalletAmountContainer>
          <WalletActions>
            <WalletActionButton Icon={QrCode} label="Show address" link="/wallet/address" />
            <WalletActionButton Icon={Send} label="Send" link="/wallet/send" />
          </WalletActions>
        </WalletAmountBox>
        <Decors />
      </WalletAmountBoxContainer>
      <AnimatePresence>
        {isHeaderCompact && (
          <CompactWalletAmountBoxContainer>
            <RefreshButton transparent squared onClick={fetchData} disabled={isLoading || pendingTxList.length > 0}>
              {isLoading || pendingTxList.length > 0 ? <Spinner /> : <RefreshCw />}
            </RefreshButton>
            <CompactWalletAmountBox>
              <WalletAmountContainer>
                <WalletAmount style={{ scale: 0.7 }}>{balance && abbreviateAmount(balance)}ℵ</WalletAmount>
              </WalletAmountContainer>
            </CompactWalletAmountBox>
          </CompactWalletAmountBoxContainer>
        )}
      </AnimatePresence>
      <TransactionContent>
        <LastTransactionListHeader>
          <LastTransactionListTitle>Last transactions</LastTransactionListTitle>
          {(isLoading || pendingTxList.length > 0) && <Spinner />}
        </LastTransactionListHeader>
        <LastTransactionList>
          {pendingTxList.map((t) => {
            return <PendingTransactionItem key={t.txId} transaction={t} />
          })}
          {loadedTxList && loadedTxList.length > 0 ? (
            loadedTxList?.map((t) => {
              return <TransactionItem key={t.hash} transaction={t} currentAddress={wallet.address} />
            })
          ) : (
            <NoTransactionMessage>No transactions yet!</NoTransactionMessage>
          )}
        </LastTransactionList>
      </TransactionContent>
    </PageContainer>
  )
}

const WalletActionButton = ({
  Icon,
  label,
  link
}: {
  Icon: (props: LucideProps) => JSX.Element
  label: string
  link: string
}) => {
  const theme = useTheme()
  return (
    <WalletActionButtonContainer>
      <ActionContent to={link}>
        <ActionButton>
          <Icon color={theme.global.accent} />
        </ActionButton>
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
        <DirectionLabel>{isOut ? 'TO' : 'FROM'}</DirectionLabel>
        <IOAddresses>{IOAddressesList && renderIOAccountList(currentAddress, IOAddressesList)}</IOAddresses>
        <TxTimestamp>{dayjs().to(t.timestamp)}</TxTimestamp>
      </TxDetails>
      <AmountBadge
        type={isOut ? 'minus' : 'plus'}
        prefix={isOut ? '- ' : '+ '}
        content={Math.abs(amountDelta)}
        amount
      />
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
          <Address key={t.toAddress}>{truncate(t.toAddress || '')}</Address>
        </IOAddresses>
        <TxTimestamp>{dayjs().to(t.timestamp)}</TxTimestamp>
      </TxDetails>
      <AmountBadge type="minus" prefix="-" content={t.amount} amount />
    </PendingTransactionItemContainer>
  )
}

const WalletAmountBoxContainer = styled(SectionContent)`
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 25px;
  margin-bottom: 25px;
  flex: 0;
  position: relative;
`

const WalletAmountBox = styled(motion.div)`
  background-color: ${({ theme }) => theme.global.accent};
  width: 100%;
  border-radius: 14px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  padding: 0 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: flex-start;
  height: 300px;
`

const CompactWalletAmountBoxContainer = styled(SectionContent)`
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 25px;
  flex: 0;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 1000;
`

const CompactWalletAmountBox = styled(motion.div)`
  background-color: ${({ theme }) => theme.font.primary};
  width: 100%;
  height: 60px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  padding: 0 25px;
  display: flex;
`

const WalletAmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1.5;
`

const WalletAmount = styled(motion.div)`
  font-size: 3rem;
  color: ${({ theme }) => theme.font.contrast};
  text-align: center;
  font-weight: 700;
`

const WalletFullAmount = styled.div`
  margin: 0 auto;
  font-size: 1rem;
  color: ${({ theme }) => theme.font.contrast};
  text-align: center;
  font-weight: 500;
`

const WalletActions = styled.div`
  display: flex;
  justify-content: space-around;
  flex: 1;
`

const WalletActionButtonContainer = styled.div`
  width: 50%;
`

const RefreshButton = styled(Button)`
  position: absolute;
  top: 0;
  left: 0;
  margin: 5px !important;
`

const ActionButton = styled.button`
  height: 40px;
  width: 40px;
  border-radius: 40px;
  background-color: ${({ theme }) => theme.bg.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`

const ActionLabel = styled.label`
  color: ${({ theme }) => theme.font.contrast};
  font-weight: 600;
  text-align: center;
`

const ActionContent = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  * {
    cursor: pointer;
  }

  &:hover {
    ${ActionButton} {
      background-color: ${({ theme }) => tinycolor(theme.bg.primary).setAlpha(0.8).toString()};
    }
  }
`
const Decors = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-image: url(${mountains});
  background-size: contain;
  background-repeat: no-repeat;
  background-position: bottom;
  opacity: 0.15;
  pointer-events: none;
`

// === TRANSACTION === //

const TransactionContent = styled(SectionContent)`
  align-items: flex-start;
  justify-content: flex-start;
`

const LastTransactionListHeader = styled.div`
  display: flex;
  align-items: center;
`

const LastTransactionListTitle = styled.h2`
  margin-right: 25px;
`

const LastTransactionList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const TransactionItemContainer = styled.div`
  height: 80px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;
  transition: all 0.1s ease-out;

  &:hover {
    background-color: ${({ theme }) => theme.bg.secondary};
  }

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }
`

const TxDetails = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const DirectionLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
`

const IOAddresses = styled.div`
  display: flex;
  flex-direction: column;
`

const Address = styled.span`
  color: ${({ theme }) => theme.global.accent};
`

const TxTimestamp = styled.span`
  color: ${({ theme }) => theme.font.secondary};
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

const NoTransactionMessage = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

export default WalletHomePage
