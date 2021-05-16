import { motion } from 'framer-motion'
import React, { useState } from 'react'
import styled from 'styled-components'
import { PageTitle, StyledContent, TitleContainer } from './PageComponents'

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

export const Modal: React.FC<{ title: string; onClose: () => void }> = ({ children, title, onClose }) => {
  const [currentTitle, setCurrentTitle] = useState(title)
  const [currentOnClose, setCurrentOnClose] = useState(() => onClose)

  return (
    <ModalContext.Provider value={{ setModalTitle: setCurrentTitle, onClose, overrideOnClose: setCurrentOnClose }}>
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
          <PageTitle onBackButtonPress={currentOnClose} smaller useLayoutId={false}>
            {currentTitle}
          </PageTitle>
          <ModalContent>{children}</ModalContent>
        </StyledModal>
        <ModalBackdrop
          onClick={() => {
            onClose && onClose()
          }}
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
`

const ModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.15);
`

const StyledModal = styled(motion.div)`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 100%;
  max-width: 600px;
  max-height: 95vh;
  box-shadow: 0 30px 30px rgba(0, 0, 0, 0.15);
  border: 2px solid ${({ theme }) => theme.border.primary};
  border-radius: 14px;
  background-color: ${({ theme }) => theme.bg.primary};
  z-index: 1;

  ${TitleContainer} {
    margin: 15px 20px 5px 20px;
  }
`

const ModalContent = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  padding: 30px 20px 0 20px;

  ${StyledContent}:last-child {
    margin-bottom: 30px;
  }
`

export default Modal
