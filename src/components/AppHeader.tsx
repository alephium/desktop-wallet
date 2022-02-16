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

import { motion, useTransform, useViewportScroll } from 'framer-motion'
import { Eye, EyeOff, Settings as SettingsIcon } from 'lucide-react'
import { FC } from 'react'
import styled, { useTheme } from 'styled-components'
import tinycolor from 'tinycolor2'

import { useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import { deviceBreakPoints } from '../style/globalStyles'
import Button from './Button'
import CompactToggle from './Inputs/CompactToggle'
import Label from './Label'
import NetworkBadge from './NetworkBadge'
import ThemeSwitcher from './ThemeSwitcher'

const AppHeader: FC<{ onSettingsClick?: () => void }> = ({ children, onSettingsClick }) => {
  const { scrollY } = useViewportScroll()
  const theme = useTheme()
  const { mainAddress } = useAddressesContext()

  const headerBGColor = useTransform(
    scrollY,
    [0, 100],
    [tinycolor(theme.bg.primary).setAlpha(0).toString(), theme.bg.primary]
  )
  const {
    settings: {
      general: { discreetMode }
    },
    updateSettings
  } = useGlobalContext()

  return (
    <HeaderContainer id="app-header" style={{ backgroundColor: headerBGColor }}>
      {(children || onSettingsClick) && (
        <>
          <ThemeSwitcher />
          <HeaderDivider />
          <CompactToggle
            toggled={discreetMode}
            onToggle={() => updateSettings('general', { discreetMode: !discreetMode })}
            IconOn={EyeOff}
            IconOff={Eye}
          />
          <HeaderDivider />
          <Button transparent squared onClick={onSettingsClick} aria-label="Settings">
            <SettingsIcon />
          </Button>
          {mainAddress && (
            <>
              <HeaderDivider />
              <Label color={mainAddress?.settings.color}>{mainAddress?.labelDisplay()}</Label>
            </>
          )}
          <HeaderDivider />
          {children && (
            <>
              {children}
              <HeaderDivider />
            </>
          )}
          <NetworkBadge />
        </>
      )}
    </HeaderContainer>
  )
}

export const HeaderDivider = styled.div`
  width: 1px;
  height: var(--spacing-2);
  background-color: ${({ theme }) => theme.border.primary};
`

const HeaderContainer = styled(motion.header)`
  height: 50px;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 900;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 var(--spacing-4);
  gap: var(--spacing-1);

  > *:not(:last-child) {
    margin-right: var(--spacing-1);
  }

  @media ${deviceBreakPoints.mobile} {
    background-color: ${({ theme }) => theme.bg.primary};
  }
`

export default AppHeader
