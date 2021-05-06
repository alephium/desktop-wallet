import { useContext, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { PageContainer, SectionContent } from '../../components/PageComponents'
import { GlobalContext } from '../../App'
import { Link } from 'react-router-dom'
import { Balance } from 'alf-client/dist/api/api-alephium'
import { Transaction } from 'alf-client/dist/api/api-explorer'
import { Send, QrCode, LucideProps } from 'lucide-react'
import tinycolor from 'tinycolor2'

const WalletHomePage = () => {
  const { wallet, setSnackbarMessage, client } = useContext(GlobalContext)
  const [balance, setBalance] = useState<Balance | undefined>(undefined)
  const [lastTransactions, setLastTransactions] = useState<Transaction[] | undefined>()

  // Set client and make initial calls
  useEffect(() => {
    const getTransactionsAndBalance = async () => {
      try {
        if (wallet && client) {
          const balance = await client.clique.getBalance(wallet.address)

          if (balance) {
            setBalance(balance)
          }

          // Transactions
          const transactions = await client.explorer.getTransactions(wallet.address)

          if (transactions) {
            setLastTransactions(transactions)
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
  }, [setSnackbarMessage, wallet, client])

  return (
    <PageContainer>
      <WalletAmountBoxContainer>
        <WalletAmountBox>
          <WalletAmountContainer>
            <WalletAmount>{balance?.balance}ℵ</WalletAmount>
          </WalletAmountContainer>
          <WalletActions>
            <WalletActionButton Icon={QrCode} label="Show address" link="/wallet/address" />
            <WalletActionButton Icon={Send} label="Send" link="/wallet/send" />
          </WalletActions>
        </WalletAmountBox>
      </WalletAmountBoxContainer>
      <TransactionContent>
        <h2>Last transactions</h2>
        <LastTransactionList>
          {lastTransactions && lastTransactions.length > 0 ? (
            lastTransactions?.map((t) => {
              return <TransactionItem key={t.hash} />
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

const WalletAmountBoxContainer = styled(SectionContent)`
  align-items: flex-start;
  justify-content: flex-start;
  margin-top: 25px;
  margin-bottom: 25px;
  flex: 0;
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
  flex: 1.5;
`

const WalletAmount = styled.div`
  margin: auto;
  font-size: 3rem;
  color: ${({ theme }) => theme.font.contrast};
  text-align: center;
  font-weight: 700;
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

const TransactionContent = styled(SectionContent)`
  align-items: flex-start;
  justify-content: flex-start;
`

const LastTransactionList = styled.div`
  display: flex;
  flex-direction: column;
`

const TransactionItem = styled.div`
  height: 80px;
`

const NoTransactionMessage = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

export default WalletHomePage
