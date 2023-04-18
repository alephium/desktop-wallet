/*
Copyright 2018 - 2023 The Alephium Authors
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

import { Settings } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import ModalPortal from '@/modals/ModalPortal'
import SettingsModal from '@/modals/SettingsModal'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'

interface SideBarProps {
  className?: string
}

const SideBar: FC<SideBarProps> = ({ className, children }) => {
  const { t } = useTranslation()

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  return (
    <div className={className}>
      {children}
      <BottomButtons>
        <ThemeSwitcher />
        <Button
          transparent
          squared
          borderless
          onClick={() => setIsSettingsModalOpen(true)}
          aria-label={t('Settings')}
          Icon={Settings}
          data-tooltip-id="sidenav"
          data-tooltip-content={t('Settings')}
        />
      </BottomButtons>
      <ModalPortal>
        {isSettingsModalOpen && <SettingsModal onClose={() => setIsSettingsModalOpen(false)} />}
      </ModalPortal>
    </div>
  )
}

export default styled(SideBar)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;

  width: ${walletSidebarWidthPx}px;
  padding: ${appHeaderHeightPx}px var(--spacing-4) var(--spacing-4);

  border-right: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.background2};
`

const BottomButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`
