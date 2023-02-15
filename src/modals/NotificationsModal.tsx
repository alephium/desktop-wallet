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
import { Lock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInOutScaleFast } from '@/animations'
import Button from '@/components/Button'
import WalletSwitcher from '@/components/WalletSwitcher'
import { useAppDispatch } from '@/hooks/redux'
import ModalContainer, { ModalContainerProps } from '@/modals/ModalContainer'
import { walletLocked } from '@/storage/app-state/slices/activeWalletSlice'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'

const NotificationsModal = ({ onClose, focusMode }: ModalContainerProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const lockWallet = () => dispatch(walletLocked())

  return (
    <ModalContainer onClose={onClose} focusMode={focusMode}>
      <NotificationsBox role="dialog" {...fadeInOutScaleFast}>
        <WalletSwitcher />
        <Button onClick={lockWallet} wide transparent Icon={Lock}>
          {t('Lock wallet')}
        </Button>
      </NotificationsBox>
    </ModalContainer>
  )
}

const NotificationsBox = styled(motion.div)`
  display: flex;
  flex-direction: column;

  position: absolute;
  left: ${walletSidebarWidthPx}px;
  top: ${appHeaderHeightPx}px;
  overflow: hidden;

  padding: 27px 19px;
  width: 304px;
  max-height: 95vh;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.bg.background1};
`

export default NotificationsModal
