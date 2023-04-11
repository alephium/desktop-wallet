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
import { usePostHog } from 'posthog-js/react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAppSelector } from '@/hooks/redux'
import { toggleTheme } from '@/storage/settings/settingsStorageUtils'

interface ThemeSwitcherProps {
  className?: string
}

const switcherSize = 30

const ThemeSwitcher = ({ className }: ThemeSwitcherProps) => {
  const { t } = useTranslation()
  const { theme } = useAppSelector((state) => state.global)
  const posthog = usePostHog()

  const isDark = theme === 'dark'

  const handleThemeToggle = () => {
    toggleTheme(isDark ? 'light' : 'dark')

    posthog?.capture('Toggled theme', { theme })
  }

  return (
    <div className={className} onClick={handleThemeToggle}>
      <ThemeRotatingContainer animate={{ rotate: isDark ? 0 : 180 }}>
        <ThemeIconContainer style={{ backgroundColor: 'var(--color-purple)' }}>
          <Moon size={20} />
        </ThemeIconContainer>
        <ThemeIconContainer style={{ backgroundColor: 'var(--color-orange)' }}>
          <Sun size={20} />
        </ThemeIconContainer>
      </ThemeRotatingContainer>
    </div>
  )
}

export default styled(ThemeSwitcher)`
  display: flex;
  overflow: hidden;
  height: ${switcherSize}px;
  width: ${switcherSize}px;
  border-radius: ${switcherSize}px;
  flex-shrink: 0;
`

const ThemeRotatingContainer = styled(motion.div)`
  transform-origin: 50% 100%;

  &:hover {
    cursor: pointer;
  }
`

const ThemeIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${switcherSize}px;
  width: ${switcherSize}px;
  border-radius: ${switcherSize}px;

  svg {
    stroke: white;
  }
`
