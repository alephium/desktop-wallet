/*
Copyright 2018 - 2021 The Alephium Authors
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
import styled, { useTheme } from 'styled-components'

interface PanelTitleProps {
  color?: string
  onBackButtonPress?: () => void
  smaller?: boolean
  backgroundColor?: string
  useLayoutId?: boolean
}

const PanelTitle: FC<PanelTitleProps> = ({
  color,
  children,
  onBackButtonPress,
  smaller,
  backgroundColor,
  useLayoutId = true
}) => {
  const { scrollY } = useViewportScroll()
  const theme = useTheme()

  const titleScale = useTransform(scrollY, [0, 50], [1, 0.6])

  return (
    <TitleContainer
      style={{ backgroundColor: backgroundColor || theme.bg.primary }}
      layoutId={useLayoutId ? 'sectionTitle' : ''}
    >
      {onBackButtonPress && <BackArrow onClick={onBackButtonPress} strokeWidth={3} />}
      <H1 color={color} smaller={smaller} style={{ scale: titleScale, originX: 0 }}>
        {children}
      </H1>
    </TitleContainer>
  )
}

export const TitleContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-3);
  position: sticky;
  top: 0;
  z-index: 1;
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

export default PanelTitle
