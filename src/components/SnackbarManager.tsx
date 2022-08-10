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

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import styled from 'styled-components'

import { useGlobalContext } from '../contexts/global'
import { deviceBreakPoints } from '../style/globalStyles'

export interface SnackbarMessage {
  text: string
  type: 'info' | 'alert' | 'success'
  duration?: number
}

const SnackbarManager = ({ message }: { message: SnackbarMessage | undefined }) => {
  const { setSnackbarMessage } = useGlobalContext()

  // Remove snackbar popup after its duration
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (message) {
      timer = setTimeout(() => setSnackbarMessage(undefined), message.duration || 3000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [message, setSnackbarMessage])

  return (
    <SnackbarManagerContainer>
      <AnimatePresence>
        {message && (
          <SnackbarPopup
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={message?.type}
          >
            {message?.text}
          </SnackbarPopup>
        )}
      </AnimatePresence>
    </SnackbarManagerContainer>
  )
}

export default SnackbarManager

const SnackbarManagerContainer = styled.div`
  position: fixed;
  bottom: 0;
  right: 0;
  display: flex;
  justify-content: flex-end;
  z-index: 10001;

  @media ${deviceBreakPoints.mobile} {
    justify-content: center;
  }
`

const SnackbarPopup = styled(motion.div)`
  margin: var(--spacing-3);
  text-align: center;
  min-width: 200px;
  padding: var(--spacing-4) var(--spacing-3);
  color: ${({ theme }) => (theme.name === 'light' ? theme.font.contrastPrimary : theme.font.primary)};
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius);
  z-index: 1000;
  box-shadow: var(--shadow-3);

  &.alert {
    background-color: ${({ theme }) => theme.global.alert};
  }

  &.info {
    background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.contrast : theme.bg.primary)};
  }

  &.success {
    background-color: ${({ theme }) => theme.global.valid};
  }
`
