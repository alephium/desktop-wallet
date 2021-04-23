import { useContext, useEffect } from 'react'
import styled from 'styled-components'
import { PageContainer, SectionContent } from '../components/PageComponents'
import { CliqueClient } from 'alf-client'
import { GlobalContext } from '../App'

const Wallet = () => {
  const { wallet } = useContext(GlobalContext)
  useEffect(() => {
    // Get wallet amount
    const response = await CliqueClient.getBalance(wallet?.address)
  })

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
