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

import { createContext, FC, useCallback, useContext, useEffect, useState } from 'react'

interface ModalContext {
  modalTitle?: string
  setModalTitle: (newTitle: string) => void
  modalSubtitle?: string
  setModalSubtitle?: (newSubtitle: string) => void
  onModalClose: () => void
  setOnModalClose: (newFn: () => void) => void
}

export const ModalContext = createContext<ModalContext>({
  modalTitle: '',
  setModalTitle: () => null,
  modalSubtitle: '',
  setModalSubtitle: () => null,
  onModalClose: () => null,
  setOnModalClose: () => null
})

interface ModalContextProviderProps {
  title?: string
  subtitle?: string
  onClose: () => void
}

export const ModalContextProvider: FC<ModalContextProviderProps> = ({ children, title, subtitle, onClose }) => {
  const [modalTitle, setModalTitle] = useState(title)
  const [modalSubtitle, setModalSubtitle] = useState(subtitle)
  const [onModalClose, setOnModalClose] = useState(() => onClose)

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
        onModalClose()
      }
    },
    [onModalClose]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKeyPress, false)

    return () => {
      document.removeEventListener('keydown', handleEscapeKeyPress, false)
    }
  }, [handleEscapeKeyPress, onModalClose])

  return (
    <ModalContext.Provider
      value={{ modalTitle, setModalTitle, modalSubtitle, setModalSubtitle, onModalClose, setOnModalClose }}
    >
      {children}
    </ModalContext.Provider>
  )
}

export const useModalContext = () => useContext(ModalContext)
