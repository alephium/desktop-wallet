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
import { FC, useCallback, useEffect } from 'react'
import styled from 'styled-components'

export interface ModalContainerProps {
  onClose: () => void
  focusMode?: boolean
  hasPadding?: boolean
  className?: string
}

const ModalContainer: FC<ModalContainerProps> = ({ children, onClose, focusMode, className }) => {
  // Prevent body scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

  // Handle escape key press
  const handleEscapeKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKeyPress, false)

    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress, false)
    }
  }, [handleEscapeKeyPress, onClose])

  return (
    <div className={className}>
      {children}
      <ModalBackdrop
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={onClose}
        focusMode={focusMode}
      />
    </div>
  )
}

export default styled(ModalContainer)<{ hasPadding?: boolean }>`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  padding: ${({ hasPadding }) => hasPadding && 'var(--spacing-4)'};
  z-index: 1000;
`

export const ModalBackdrop = styled(motion.div)<{ focusMode?: boolean; light?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: ${({ theme, focusMode, light }) =>
    theme.name === 'light'
      ? focusMode
        ? 'rgba(0, 0, 0, 0.8)'
        : 'rgba(0, 0, 0, 0.15)'
      : focusMode
      ? 'rgba(0, 0, 0, 0.9)'
      : light
      ? 'rgba(0, 0, 0, 0.15)'
      : 'rgba(0, 0, 0, 0.6)'};
`
