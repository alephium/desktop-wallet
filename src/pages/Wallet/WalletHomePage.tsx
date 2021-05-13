import { useContext, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { PageContainer, SectionContent } from '../../components/PageComponents'
import { GlobalContext } from '../../App'
import { Link } from 'react-router-dom'
import { Transaction } from 'alf-client/dist/api/api-explorer'
import { Send, QrCode, LucideProps } from 'lucide-react'
import tinycolor from 'tinycolor2'
import { abbreviateAmount, calAmountDelta } from '../../utils/util'
import mountains from '../../images/mountain.svg'
import AmountBadge from '../../components/Badge'

const WalletHomePage = () => {
  const { wallet, setSnackbarMessage, client } = useContext(GlobalContext)
  const [balance, setBalance] = useState<number | undefined>(undefined)
  const [lastTransactions, setLastTransactions] = useState<Transaction[] | undefined>()

  // Set client and make initial calls
  useEffect(() => {
    const getTransactionsAndBalance = async () => {
      try {
        if (wallet && client) {
          const addressDetails = await client.explorer.getAddressDetails(wallet.address)

          if (addressDetails.balance) {
            setBalance(addressDetails.balance)
          }

          // Transactions
          if (addressDetails.transactions) {
            console.log(addressDetails.transactions)
            setLastTransactions(addressDetails.transactions)
          }
        }
      } catch (e) {
        console.log(e)
        setSnackbarMessage({
          text: 'Something went wrong when fetching transactions and balance.',
          type: 'alert'
        })
      }
    }

    getTransactionsAndBalance()
  }, [setSnackbarMessage, wallet, client, balance])

  if (!wallet) return null

  return (
    <PageContainer>
      <WalletAmountBoxContainer>
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
      <TransactionContent>
        <h2>Last transactions</h2>
        <LastTransactionList>
          {lastTransactions && lastTransactions.length > 0 ? (
            lastTransactions?.map((t) => {
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

  return (
    <TransactionItemContainer>
      <AmountBadge type={isOut ? 'minus' : 'plus'} prefix={isOut ? '- ' : '+ '} content={amountDelta} amount />
    </TransactionItemContainer>
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

const WalletAmountBox = styled.div`
  background-color: ${({ theme }) => theme.global.accent};
  width: 100%;
  height: 30vh;
  border-radius: 14px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.1);
  padding: 0 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: flex-start;
`

const WalletAmountContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1.5;
`

const WalletAmount = styled.div`
  margin: 0 auto;
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

const LastTransactionList = styled.div`
  display: flex;
  flex-direction: column;
`

const TransactionItemContainer = styled.div`
  height: 80px;
`

const NoTransactionMessage = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

export default WalletHomePage
