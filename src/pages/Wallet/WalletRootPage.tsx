import React, { useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { MainContainer, PageContainer, SectionContent } from '../../components/PageComponents'
import { GlobalContext } from '../../App'
import { useHistory } from 'react-router-dom'
import { createClient } from '../../utils/util'
import { CliqueClient } from 'alf-client'
import { Balance } from 'alf-client/dist/api/Api'

const Wallet = () => {
  const { wallet, setSnackbarMessage } = useContext(GlobalContext)
  const history = useHistory()
  const [balance, setBalance] = useState<Balance | undefined>(undefined)
  //const [lastTransactions, setLastTransactions] = useState<Transaction[]>()

  const client = useRef<CliqueClient>()

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
        client.current = await createClient()
      } catch (e) {
        console.log(e)
        setSnackbarMessage({
          text: 'Unable to initialize the client, please check your network settings.',
          type: 'alert'
        })
      } finally {
        if (wallet && client.current) {
          const balance = await client.current.getBalance(wallet.address)

          if (balance) {
            setBalance(balance)
          }
        }
      }
    }

    getClient()

    //const settings = settingsLoadOrDefault()
  }, [setSnackbarMessage, wallet])

  return (
    <MainContainer>
      <PageContainer>
        <WalletAmountBoxContainer>
          <WalletAmountBox>
            <WalletAmount>{balance?.balance}ℵ</WalletAmount>
          </WalletAmountBox>
        </WalletAmountBoxContainer>
        <TransactionContent>
          <h2>Last transactions</h2>
          <LastTransactionList>{}</LastTransactionList>
        </TransactionContent>
      </PageContainer>
    </MainContainer>
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

const TransactionContent = styled(SectionContent)`
  align-items: flex-start;
  justify-content: flex-start;
`

const LastTransactionList = styled.div`
  display: flex;
  flex-direction: column;
`

export default Wallet
