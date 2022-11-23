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
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useGlobalContext } from '../contexts/global'
import useSwitchTheme from '../hooks/useSwitchTheme'
import Toggle from './Inputs/Toggle'

interface ThemeSwitcherProps {
  className?: string
}

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ className }) => {
  const { t } = useTranslation('App')
  const switchTheme = useSwitchTheme()
  const {
    settings: {
      general: { theme: currentTheme }
    }
  } = useGlobalContext()

  const isDark = currentTheme === 'dark'

  return (
    <Toggle
      label={t`Activate dark mode`}
      ToggleIcons={[Sun, Moon]}
      handleColors={['var(--color-orange)', 'var(--color-purple)']}
      toggled={isDark}
      onToggle={() => switchTheme(isDark ? 'light' : 'dark')}
    />
  )
}

export default ThemeSwitcher
