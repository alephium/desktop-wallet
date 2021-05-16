import { motion } from 'framer-motion'
import styled from 'styled-components'
import { TitleContainer } from './PageComponents'

export const Modal: React.FC<{ onClose?: React.MouseEventHandler<HTMLDivElement> | undefined }> = ({
  children,
  onClose
}) => {
  return (
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
        {children}
      </StyledModal>
      <ModalBackdrop
        onClick={(e) => {
          onClose && onClose(e)
        }}
      />
    </ModalContainer>
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
  margin: auto;
  width: 100%;
  max-width: 600px;
  max-height: 95vh;
  padding: 30px 20px;
  box-shadow: 0 30px 30px rgba(0, 0, 0, 0.15);
  border: 2px solid ${({ theme }) => theme.border.primary};
  border-radius: 14px;
  background-color: ${({ theme }) => theme.bg.primary};
  z-index: 1;

  ${TitleContainer} {
    margin-top: 0;
  }
`

export default Modal
