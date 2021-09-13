import styled from 'styled-components'

const AppHeader = () => {
  return <HeaderContainer id="app-header"></HeaderContainer>
}

const HeaderContainer = styled.header`
  height: 50px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10000;
`

export default AppHeader
