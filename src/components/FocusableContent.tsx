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

import { AnimatePresence } from 'framer-motion'
import { ChevronsDownUp } from 'lucide-react'
import { KeyboardEvent, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeInOutFast } from '@/animations'
import Button from '@/components/Button'
import { ModalBackdrop } from '@/modals/ModalContainer'

interface FocusableContentProps {
  isFocused: boolean
  className?: string
  onClose: () => void
}

const FocusableContent: FC<FocusableContentProps> = ({ className, children, isFocused, onClose }) => {
  const { t } = useTranslation()
  const modalRef = useRef<HTMLDivElement>(null)

  const handleEscapeKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onClose()
      e.stopPropagation()
    }
  }

  useEffect(() => {
    if (isFocused) modalRef.current?.focus()
  }, [isFocused, modalRef])

  return (
    <div className={className} ref={modalRef} onKeyDown={handleEscapeKeyPress} tabIndex={0}>
      <AnimatePresence>{isFocused && <ModalBackdrop {...fadeInOutFast} onClick={onClose} />}</AnimatePresence>
      <Content>
        {children}

        {isFocused && (
          <CollapseRow>
            <Button role="secondary" variant="contrast" onClick={onClose} Icon={ChevronsDownUp} short>
              {t('Close')}
            </Button>
          </CollapseRow>
        )}
      </Content>
    </div>
  )
}

const Content = styled.div`
  height: 100%;
`

export default styled(FocusableContent)`
  &:focus {
    outline: none;
  }

  ${ModalBackdrop} {
    z-index: 2;
  }

  ${({ isFocused }) =>
    isFocused &&
    css`
      ${Content} {
        z-index: 2;
        position: relative;
      }
    `}
`

const CollapseRow = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: center;
  bottom: -60px;
`
