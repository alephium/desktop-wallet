import React, { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { MainContainer, PageContainer, SectionContent } from '../../components/PageComponents'
import { GlobalContext } from '../../App'
import { useHistory } from 'react-router-dom'
import { createClient } from '../../utils/util'
import { Balance } from 'alf-client/dist/api/api-alephium'
import { AsyncReturnType } from 'type-fest'
import { Transaction } from 'alf-client/dist/api/api-explorer'
import { Send, QrCode } from 'lucide-react'

const Wallet = () => {
  const { wallet, setSnackbarMessage } = useContext(GlobalContext)
  const history = useHistory()
  const [balance, setBalance] = useState<Balance | undefined>(undefined)
  const [lastTransactions, setLastTransactions] = useState<Transaction[] | undefined>()

  const client = useRef<AsyncReturnType<typeof createClient>>()

  // Redirect if not wallet is set
  useEffect(() => {
    if (!wallet) {
      history.push('/')
    }
  }, [history, wallet])

  // Set client and make initial calls
  useEffect(() => {
    const getClient = async () => {
      try {
        // Get clients

        client.current = await createClient()
      } catch (e) {
        console.log(e)
        setSnackbarMessage({
          text: 'Unable to initialize the client, please check your network settings.',
          type: 'alert'
        })
      } finally {
        if (wallet && client.current) {
          const balance = await client.current.clique.getBalance(wallet.address)

          if (balance) {
            setBalance(balance)
          }

          // Transactions
          const transactions = await client.current.explorer.getTransactions(wallet.address)

          if (transactions) {
            setLastTransactions(transactions)
          }
        }
      }
    }

    getClient()
  }, [setSnackbarMessage, wallet])

  return (
    <MainContainer>
      <PageContainer>
        <WalletAmountBoxContainer>
          <WalletAmountBox>
            <WalletAmount>{balance?.balance}ℵ</WalletAmount>
            <WalletActions>
              <WalletActionButton icon={<QrCode />} />
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
    </MainContainer>
  )
}

const WalletActionButton = ({ icon }: { icon: JSX.Element }) => {
  return (
    <WalletActionButtonContainer>
      <ActionButton>{icon}</ActionButton>
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
  padding: 25px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: flex-start;
`

const WalletAmount = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.font.contrast};
  text-align: center;
  font-weight: 700;
`

const WalletActions = styled.div`
  display: flex;
`
const WalletActionButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const ActionButton = styled.button``

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

export default Wallet
