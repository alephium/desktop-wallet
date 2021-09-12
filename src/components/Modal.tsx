import { motion } from 'framer-motion'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Button } from './Buttons'
import { PageTitle, StyledContent, TitleContainer } from './PageComponents'
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

  const handleClose = () => {
    currentOnClose()
  }

  useEffect(() => {
    // Prevent body scroll on mount
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

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
            <PageTitle smaller useLayoutId={false}>
              {currentTitle}
            </PageTitle>
            <CloseButton squared transparent onClick={handleClose}>
              <X />
            </CloseButton>
          </ModalHeader>
          <ModalContent>{children}</ModalContent>
        </StyledModal>
        <ModalBackdrop
          style={{ backgroundColor: focusMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.15)' }}
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
  max-width: 600px;
  max-height: 95vh;
  box-shadow: 0 30px 30px rgba(0, 0, 0, 0.15);
  border-radius: 14px;
  background-color: ${({ theme }) => theme.bg.primary};
  z-index: 1;

  ${TitleContainer} {
    flex: 1;
    margin: 15px 20px 15px 20px;
  }
`

const ModalHeader = styled.header`
  display: flex;
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
