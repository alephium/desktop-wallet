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

import { Moon, Sun } from 'lucide-react'
import { FC, useCallback } from 'react'

import { useGlobalContext } from '../contexts/global'
import { ThemeType } from '../style/themes'
import Toggle from './Inputs/Toggle'

interface ThemeSwitcherProps {
  className?: string
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

  const handleThemeToggle = () => switchTheme(currentTheme === 'light' ? 'dark' : 'light')

  return (
    <Toggle
      ToggleIcons={[Sun, Moon]}
      handleColors={['var(--color-orange)', 'var(--color-purple)']}
      toggled={currentTheme === 'dark'}
      onToggle={handleThemeToggle}
    />
  )
}

export default ThemeSwitcher
