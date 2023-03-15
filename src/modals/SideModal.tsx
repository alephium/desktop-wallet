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
import { X } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fastTransition } from '@/animations'
import Button from '@/components/Button'
import Scrollbar from '@/components/Scrollbar'
import useFocusOnMount from '@/hooks/useFocusOnMount'
import ModalContainer, { ModalContainerProps } from '@/modals/ModalContainer'

interface SideModalProps extends ModalContainerProps {
  label: string
  header?: ReactNode
  width?: number
}

const SideModal = ({ onClose, children, label, header, width = 500 }: SideModalProps) => {
  const { t } = useTranslation()
  const elRef = useFocusOnMount<HTMLDivElement>()

  return (
    <ModalContainer onClose={onClose}>
      <Sidebar
        role="dialog"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        {...fastTransition}
        width={width}
      >
        {header && (
          <ModalHeader>
            <HeaderColumn>{header}</HeaderColumn>
            <CloseButton aria-label={t('Close')} squared role="secondary" transparent onClick={onClose} Icon={X} />
          </ModalHeader>
        )}
        <Scrollbar>
          <div ref={elRef} tabIndex={0} aria-label={label}>
            {children}
          </div>
        </Scrollbar>
      </Sidebar>
    </ModalContainer>
  )
}

export default SideModal

const Sidebar = styled(motion.div)<{ width: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ width }) => width}px;
  max-height: 95vh;
  background-color: ${({ theme }) => theme.bg.background1};
  position: relative;
  overflow: auto;
  margin: 25px 20px 25px auto;
  border-radius: var(--radius);
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 15px 25px;
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
`

const HeaderColumn = styled.div`
  flex-grow: 1;
`

const CloseButton = styled(Button)`
  color: ${({ theme }) => theme.font.primary};
  flex-shrink: 0;
`
