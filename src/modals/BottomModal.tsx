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
import styled from 'styled-components'

import { fastTransition } from '@/animations'
import Scrollbar from '@/components/Scrollbar'
import useFocusOnMount from '@/hooks/useFocusOnMount'
import ModalContainer, { ModalContainerProps } from '@/modals/ModalContainer'

interface BottomModalProps extends ModalContainerProps {
  label: string
  contentHeight?: number
  className?: string
}

const BottomModal = ({ onClose, children, label, contentHeight, className }: BottomModalProps) => {
  const elRef = useFocusOnMount<HTMLDivElement>()

  return (
    <ModalContainer onClose={onClose} className={className}>
      <Content
        role="dialog"
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        {...fastTransition}
        style={{ maxHeight: contentHeight }}
      >
        <Scrollbar>
          <div ref={elRef} tabIndex={0} aria-label={label}>
            {children}
          </div>
        </Scrollbar>
      </Content>
    </ModalContainer>
  )
}

export default BottomModal

const Content = styled(motion.div)`
  display: flex;
  flex-direction: column;
  margin-top: auto;
  /* height: auto; */
  height: 100%;
  max-height: 95%;
  width: 100%;
  position: relative;
  overflow: auto;
`
