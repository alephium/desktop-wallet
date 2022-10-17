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

import { motion, useTransform, useViewportScroll } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { FC } from 'react'
import styled, { css } from 'styled-components'

interface PanelTitleProps {
  color?: string
  onBackButtonClick?: () => void
  smaller?: boolean
  useLayoutId?: boolean
  isSticky?: boolean
}

const PanelTitle: FC<PanelTitleProps> = ({
  color,
  children,
  onBackButtonClick,
  smaller,
  useLayoutId = true,
  isSticky = true
}) => {
  const { scrollY } = useViewportScroll()

  const titleScale = useTransform(scrollY, [0, 50], [1, 0.6])

  return (
    <TitleContainer layoutId={useLayoutId ? 'sectionTitle' : ''} isSticky={isSticky}>
      {onBackButtonClick && (
        <BackArrow
          onClick={onBackButtonClick}
          onKeyPress={onBackButtonClick}
          strokeWidth={3}
          role="button"
          tabIndex={0}
        />
      )}
      <H1 color={color} smaller={smaller} style={isSticky ? { scale: titleScale, originX: 0 } : {}}>
        {children}
      </H1>
    </TitleContainer>
  )
}

export default PanelTitle

export const TitleContainer = styled(motion.div)<{ isSticky: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-3);
  top: 0;

  ${({ isSticky }) =>
    isSticky &&
    css`
      position: sticky;
    `}
`

const BackArrow = styled(ArrowLeft)`
  height: 47px;
  width: var(--spacing-4);
  margin-right: var(--spacing-4);
  cursor: pointer;
`

const H1 = styled(motion.h1)<{ color?: string; smaller?: boolean }>`
  flex: 1;
  margin: 0;
  color: ${({ theme, color }) => (color ? color : theme.font.primary)};
  font-size: ${({ smaller }) => (smaller ? '2.0em' : 'revert')};
  font-weight: var(--fontWeight-medium);
`
