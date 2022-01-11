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

import { motion, Transition } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { FC, useCallback } from 'react'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import { ThemeType } from '../style/themes'

interface ThemeSwitcherProps {
  className?: string
}

const toggleVariants = {
  light: { left: 0, backgroundColor: 'var(--color-orange)' },
  dark: { left: '50%', backgroundColor: 'var(--color-purple)' }
}

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ className }) => {
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

  const transition: Transition = { duration: 0.2, type: 'tween' }

  return (
    <StyledThemeSwitcher onClick={() => switchTheme(currentTheme === 'light' ? 'dark' : 'light')} className={className}>
      <ToggleContent>
        <ToggleIcon>
          <Sun color={getButtonColor(currentTheme, 'light')} size={18} />
        </ToggleIcon>
        <ToggleIcon>
          <Moon color={getButtonColor(currentTheme, 'dark')} size={18} />
        </ToggleIcon>
      </ToggleContent>
      <ToggleFloatingIndicator variants={toggleVariants} animate={currentTheme} transition={transition} />
    </StyledThemeSwitcher>
  )
}

const getButtonColor = (theme: ThemeType, buttonTheme: string) => {
  return theme === buttonTheme ? (theme === 'dark' ? 'var(--color-orange)' : 'var(--color-white)') : 'var(--color-grey)'
}

export const StyledThemeSwitcher = styled.div<ThemeSwitcherProps>`
  position: relative;
  width: calc(var(--toggleHeight) * 2);
  height: var(--toggleHeight);
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: calc(var(--toggleHeight) * 2);
  background-color: ${({ theme }) => theme.bg.secondary};
  overflow: hidden;
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
  border-radius: calc(var(--toggleHeight) * 2);
  z-index: 0;
`

export default ThemeSwitcher
