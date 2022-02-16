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
import { FC } from 'react'
import styled, { css } from 'styled-components'

import { ModalContextProvider } from '../contexts/modal'

export interface ModalProps {
  title?: string
  subtitle?: string
  onClose: () => void
  focusMode?: boolean
  isLoading?: boolean
  hasPadding?: boolean
}

const Modal: FC<ModalProps> = ({ children, title, subtitle, onClose, focusMode, hasPadding = true }) => (
  <ModalContextProvider title={title} subtitle={subtitle} onClose={onClose}>
    <ModalContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      hasPadding={hasPadding}
    >
      {children}
      <ModalBackdrop onClick={onClose} focusMode={focusMode} />
    </ModalContainer>
  </ModalContextProvider>
)

const ModalContainer = styled(motion.div)<{ hasPadding?: boolean }>`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  padding: ${({ hasPadding }) => hasPadding && css`var(--spacing-4)`};
  z-index: 1000;
`

export const ModalBackdrop = styled.div<{ focusMode?: boolean; light?: boolean }>`
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

export default Modal
