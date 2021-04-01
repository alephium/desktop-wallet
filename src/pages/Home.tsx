import React from 'react'
import styled from 'styled-components'

const Home = () => {
  return (
    <Container>
      <Header>

      </Header>
      <Content>

      </Content>
    </Container>
  )
}

// === Styling

const Container = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const Header = styled.header`
  flex: 1;
  background-color: ${({theme}) => theme.bg.contrast };
`
const Content = styled.div`
  flex: 1;
`

export default Home