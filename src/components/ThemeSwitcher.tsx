import React, { useContext } from 'react'
import styled from 'styled-components'
import { Moon, Sun } from 'lucide-react'
import { ThemeType } from '../style/themes'
import { motion } from 'framer-motion'
import { GlobalContext } from '../App'

interface ThemeSwitcherProps {
  className?: string
}

const getButtonColor = (theme: ThemeType, buttonTheme: string) => {
  return theme === buttonTheme ? (theme === 'dark' ? '#F6C76A' : 'white') : '#646775'
}

const toggleWidth = 80
const toggleHeight = toggleWidth / 2
const toggleIndicatorSize = toggleWidth / 2

const toggleVariants = {
  light: { left: 0, backgroundColor: '#F6C76A' },
  dark: { left: toggleWidth - toggleIndicatorSize, backgroundColor: '#3A0595' }
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className }) => {
  const { currentTheme, switchTheme } = useContext(GlobalContext)

  return (
    <StyledThemeSwitcher onClick={() => switchTheme(currentTheme === 'light' ? 'dark' : 'light')} className={className}>
      <ToggleContent>
        <ToggleIcon>
          <Sun onClick={() => switchTheme('light')} color={getButtonColor(currentTheme, 'light')} size={18} />
        </ToggleIcon>
        <ToggleIcon>
          <Moon onClick={() => switchTheme('dark')} color={getButtonColor(currentTheme, 'dark')} size={18} />
        </ToggleIcon>
      </ToggleContent>
      <ToggleFloatingIndicator
        variants={toggleVariants}
        animate={currentTheme}
        transition={{ duration: 0.5, type: 'spring' }}
      />
    </StyledThemeSwitcher>
  )
}

export const StyledThemeSwitcher = styled.div`
  position: relative;
  width: ${toggleWidth}px;
  height: ${toggleHeight}px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: 60px;
  background-color: ${({ theme }) => theme.bg.secondary};
  cursor: pointer;
  box-sizing: content-box;

  svg {
    cursor: pointer;
  }
`

const ToggleContent = styled.div`
  position: absolute;
  display: flex;
  height: 100%;
  width: 100%;
  margin: 0;
  z-index: 1;
`

const ToggleIcon = styled.div`
  display: flex;
  flex: 1;

  * {
    margin: auto;
  }
`

const ToggleFloatingIndicator = styled(motion.div)`
  position: absolute;
  width: ${toggleIndicatorSize}px;
  height: ${toggleIndicatorSize}px;
  background-color: ${({ theme }) => theme.font.primary};
  border-radius: 60px;
  z-index: 0;
`

export default ThemeSwitcher
