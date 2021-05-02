import React, { useContext, useEffect } from 'react'
import { MainContainer } from '../../components/PageComponents'
import { GlobalContext } from '../../App'
import { Route, BrowserRouter as Router, useHistory } from 'react-router-dom'
import WalletHomePage from './WalletHomePage'
import SendPage from './SendPage'

const Wallet = () => {
  const { wallet } = useContext(GlobalContext)
  const history = useHistory()

  // Redirect if not wallet is set
  useEffect(() => {
    if (!wallet) {
      history.push('/')
    }
  }, [history, wallet])

  return (
    <MainContainer>
      <Router>
        <Route path="/wallet">
          <WalletHomePage />
        </Route>
        <Route path="/wallet/send">
          <SendPage />
        </Route>
      </Router>
    </MainContainer>
  )
}

export default Wallet
