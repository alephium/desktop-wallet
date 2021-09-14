import { motion, useTransform, useViewportScroll } from 'framer-motion'
import { FC } from 'react'
import styled from 'styled-components'
import { deviceBreakPoints } from '../style/globalStyles'

const AppHeader: FC = ({ children }) => {
  const { scrollY } = useViewportScroll()

  const headerBGColor = useTransform(scrollY, [0, 100], ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)'])

  return (
    <HeaderContainer id="app-header" style={{ backgroundColor: headerBGColor }}>
      {children}
    </HeaderContainer>
  )
}

const HeaderContainer = styled(motion.header)`
  height: 50px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 10000;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 20px;

  > *:not(:last-child) {
    margin-right: 5px;
  }

  @media ${deviceBreakPoints.mobile} {
    background-color: ${({ theme }) => theme.bg.primary};
  }
`

export default AppHeader
