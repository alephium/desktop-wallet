import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { PageContainer, SectionContent } from '../../components/PageComponents'
import { GlobalContext } from '../../App'
import { useHistory } from 'react-router-dom'

const Wallet = () => {
  const { wallet } = useContext(GlobalContext)
  const history = useHistory()

  useEffect(() => {
    console.log(wallet)
    if (!wallet) {
      history.push('/')
    }
  }, [history, wallet])

  return (
    <PageContainer>
      <SectionContent>
        <WalletAmountBox>
          <WalletAmount>{1}ℵ</WalletAmount>
        </WalletAmountBox>
      </SectionContent>
    </PageContainer>
  )
}

const WalletAmountBox = styled.div`
  background-color: ${({ theme }) => theme.global.accent};
`

const WalletAmount = styled.div`
  font-size: 3rem;
`

export default Wallet
