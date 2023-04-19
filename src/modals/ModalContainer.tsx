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

import { motion, MotionProps } from 'framer-motion'
import { KeyboardEvent, ReactNode, useEffect, useRef } from 'react'
import styled from 'styled-components'

import { fadeInOutFast } from '@/animations'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useFocusOnMount from '@/hooks/useFocusOnMount'
import { modalClosed, modalOpened } from '@/storage/global/globalActions'

export interface ModalContainerProps extends MotionProps {
  onClose: () => void
  children?: ReactNode | ReactNode[]
  focusMode?: boolean
  hasPadding?: boolean
  className?: string
}

const ModalContainer = ({ onClose, children, focusMode, className }: ModalContainerProps) => {
  const dispatch = useAppDispatch()
  const moveFocusOnPreviousModal = useMoveFocusOnPreviousModal()
  const modalRef = useFocusOnMount<HTMLDivElement>()
  const modalId = useRef<string>(`modal-${new Date().valueOf()}`)

  // Prevent body scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    dispatch(modalOpened(modalId.current))

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [dispatch])

  // Handle escape key press
  const handleEscapeKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      closeModal()
      e.stopPropagation()
    }
  }

  const closeModal = () => {
    onClose()
    moveFocusOnPreviousModal()
  }

  return (
    <motion.div className={className} onKeyDown={handleEscapeKeyPress} tabIndex={0} id={modalId.current} ref={modalRef}>
      <ModalBackdrop {...fadeInOutFast} onClick={closeModal} focusMode={focusMode} />
      {children}
    </motion.div>
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
  z-index: 1;

  &:focus {
    outline: none;
  }
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

export const useMoveFocusOnPreviousModal = () => {
  const visibleModals = useAppSelector((state) => state.global.visibleModals)
  const dispatch = useAppDispatch()

  const previouslyOpenedModal = visibleModals.at(-2)

  const moveFocusOnPreviousModal = () => {
    dispatch(modalClosed())

    if (previouslyOpenedModal) document.getElementById(previouslyOpenedModal)?.focus()
  }

  return moveFocusOnPreviousModal
}
