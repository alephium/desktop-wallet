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

interface PopupProps {
  onBackgroundClick: () => void
  title?: string
}

const Popup: FC<PopupProps> = ({ children, onBackgroundClick, title }) => {
  const handleEscapeKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBackgroundClick()
      }
    },
    [onBackgroundClick]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKeyPress, false)
    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress, false)
    }
  }, [handleEscapeKeyPress, onBackgroundClick])

  return (
    <PopupContainer initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onBackgroundClick}>
      <PopupContent
        onClick={(e) => {
          e.stopPropagation()
        }}
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        exit={{ y: -10 }}
      >
        {title && (
          <PopupHeader>
            <h2>{title}</h2>
          </PopupHeader>
        )}
        {children}
      </PopupContent>
    </PopupContainer>
  )
}

export default Popup

const PopupContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  display: flex;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 1000;
`

const PopupContent = styled(motion.div)`
  border-radius: var(--radius);
  margin: auto;
  width: 30vw;
  min-width: 300px;
  max-height: 500px;
  overflow-x: hidden;
  overflow-y: auto;
  box-shadow: var(--shadow-3);
  background-color: ${({ theme }) => theme.bg.primary};
`

const PopupHeader = styled.div`
  padding: var(--spacing-1) var(--spacing-3);
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.secondary};
  display: flex;
  align-items: center;
`
