// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { motion } from 'framer-motion'
import React, { useCallback, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'
import { Button } from './Buttons'
import { PanelTitle, StyledContent, TitleContainer } from './PageComponents'
import { X } from 'lucide-react'

interface ModalContext {
  setModalTitle: (newTitle: string) => void
  onClose: () => void
  overrideOnClose: (newFn: () => void) => void
}

export const ModalContext = React.createContext<ModalContext>({
  setModalTitle: () => null,
  onClose: () => null,
  overrideOnClose: () => null
})

export const Modal: React.FC<{ title: string; onClose: () => void; focusMode?: boolean }> = ({
  children,
  title,
  onClose,
  focusMode
}) => {
  const [currentTitle, setCurrentTitle] = useState(title)
  const [currentOnClose, setCurrentOnClose] = useState(() => onClose)
  const theme = useTheme()

  const handleClose = () => {
    currentOnClose()
  }

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
    <ModalContext.Provider
      value={{ setModalTitle: setCurrentTitle, onClose: currentOnClose, overrideOnClose: setCurrentOnClose }}
    >
      <ModalContainer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <StyledModal
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <ModalHeader>
            <PanelTitle smaller useLayoutId={false}>
              {currentTitle}
            </PanelTitle>
            <CloseButton squared transparent onClick={handleClose}>
              <X />
            </CloseButton>
          </ModalHeader>
          <ModalContent>{children}</ModalContent>
        </StyledModal>
        <ModalBackdrop
          style={{
            backgroundColor:
              theme.name === 'light'
                ? focusMode
                  ? 'rgba(0, 0, 0, 0.8)'
                  : 'rgba(0, 0, 0, 0.15)'
                : focusMode
                ? 'rgba(0, 0, 0, 0.9)'
                : 'rgba(0, 0, 0, 0.6)'
          }}
          onClick={handleClose}
        />
      </ModalContainer>
    </ModalContext.Provider>
  )
}

const ModalContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  padding: 20px;
  z-index: 1000;
`

const ModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`

const StyledModal = styled(motion.div)`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 100%;
  max-width: 500px;
  max-height: 95vh;
  box-shadow: 0 30px 30px rgba(0, 0, 0, 0.15);
  border-radius: 7px;
  background-color: ${({ theme }) => theme.bg.primary};
  z-index: 1;

  ${TitleContainer} {
    flex: 1;
    margin: 15px 20px 15px 20px;
  }
`

const ModalHeader = styled.header`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`

const CloseButton = styled(Button)`
  color: ${({ theme }) => theme.font.primary};
  margin-right: 10px;
`

const ModalContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 20px 0 20px;

  ${StyledContent}:last-child {
    margin-bottom: 30px;
  }
`

export default Modal
