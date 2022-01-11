/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { motion } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { FC, useCallback } from 'react'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import { ThemeType } from '../style/themes'

interface ThemeSwitcherProps {
  small?: boolean
  className?: string
}

const toggleVariants = {
  light: { left: 0, backgroundColor: 'var(--color-orange)' },
  dark: { left: '50%', backgroundColor: 'var(--color-purple)' }
}

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ small = false, className }) => {
  const {
    settings: {
      general: { theme: currentTheme }
    },
    updateSettings
  } = useGlobalContext()

  const switchTheme = useCallback(
    (theme: ThemeType) => {
      updateSettings('general', { theme })
    },
    [updateSettings]
  )

  return (
    <StyledThemeSwitcher
      onClick={() => switchTheme(currentTheme === 'light' ? 'dark' : 'light')}
      className={className}
      small={small}
    >
      <ToggleContent>
        <ToggleIcon>
          <Sun color={getButtonColor(currentTheme, 'light')} size={18} />
        </ToggleIcon>
        <ToggleIcon>
          <Moon color={getButtonColor(currentTheme, 'dark')} size={18} />
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

const getButtonColor = (theme: ThemeType, buttonTheme: string) => {
  return theme === buttonTheme ? (theme === 'dark' ? 'var(--color-orange)' : 'var(--color-white)') : 'var(--color-grey)'
}

const toggleWidth = 80
const toggleHeight = toggleWidth / 2

export const StyledThemeSwitcher = styled.div<ThemeSwitcherProps>`
  position: relative;
  width: ${({ small }) => (small ? toggleWidth / 1.5 : toggleWidth)}px;
  height: ${({ small }) => (small ? toggleHeight / 1.5 : toggleHeight)}px;
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
  width: 50%;
  height: 100%;
  background-color: ${({ theme }) => theme.font.primary};
  border-radius: 60px;
  z-index: 0;
`

export default ThemeSwitcher
