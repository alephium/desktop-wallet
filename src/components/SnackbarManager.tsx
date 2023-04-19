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

import { colord } from 'colord'
import { motion } from 'framer-motion'
import { useEffect } from 'react'
import styled, { css } from 'styled-components'

import { fadeInBottom, fadeOut } from '@/animations'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import { snackbarDisplayTimeExpired } from '@/storage/global/globalActions'
import { deviceBreakPoints, walletSidebarWidthPx } from '@/style/globalStyles'

const SnackbarManager = () => {
  const dispatch = useAppDispatch()
  const messages = useAppSelector((state) => state.snackbar.messages)

  const message = messages.length > 0 ? messages[0] : undefined

  // Remove snackbar popup after its duration
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (message && message.duration >= 0) {
      timer = setTimeout(() => dispatch(snackbarDisplayTimeExpired()), message.duration)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [dispatch, message])

  return (
    <ModalPortal>
      {message?.text && (
        <SnackbarManagerContainer>
          <SnackbarPopup {...fadeInBottom} {...fadeOut} className={message.type}>
            {message.text}
          </SnackbarPopup>
        </SnackbarManagerContainer>
      )}
    </ModalPortal>
  )
}

export default SnackbarManager

const getSnackbarStyling = (color: string) => css`
  background-color: ${colord(color).alpha(0.1).toHex()};
  border: 1px solid ${colord(color).alpha(0.2).toHex()};
  color: ${color};
`

const SnackbarManagerContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: ${walletSidebarWidthPx}px;
  display: flex;
  justify-content: flex-end;
  z-index: 2;

  @media ${deviceBreakPoints.mobile} {
    justify-content: center;
  }
`

const SnackbarPopup = styled(motion.div)`
  margin: var(--spacing-3);
  text-align: center;
  min-width: 200px;
  padding: var(--spacing-4) var(--spacing-3);
  color: ${({ theme }) => theme.font.primary};
  border-radius: var(--radius-medium);
  backdrop-filter: blur(30px);

  &.alert {
    ${({ theme }) => getSnackbarStyling(theme.global.alert)}
  }

  &.info {
    ${({ theme }) => getSnackbarStyling(theme.font.primary)}
  }

  &.success {
    ${({ theme }) => getSnackbarStyling(theme.global.valid)}
  }
`
