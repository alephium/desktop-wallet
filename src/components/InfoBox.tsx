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
import { FC } from 'react'
import styled, { css, useTheme } from 'styled-components'

import { sectionChildrenVariants } from './PageComponents/PageContainers'

type InfoBoxImportance = 'accent' | 'alert'

interface InfoBoxProps {
  text?: string
  Icon?: LucideIconType
  label?: string
  importance?: InfoBoxImportance
  ellipsis?: boolean
  wordBreak?: boolean
  onClick?: () => void
  small?: boolean
  short?: boolean
  contrast?: boolean
  noBorders?: boolean
  className?: string
}

const InfoBox: FC<InfoBoxProps> = ({
  Icon,
  text,
  label,
  importance,
  className,
  ellipsis,
  wordBreak,
  onClick,
  short,
  children,
  contrast,
  noBorders
}) => {
  const theme = useTheme()

  return (
    <div className={className} onClick={onClick}>
      {label && <Label variants={sectionChildrenVariants}>{label}</Label>}
      <StyledBox
        variants={sectionChildrenVariants}
        importance={importance}
        short={short}
        contrast={contrast}
        noBorders={noBorders}
      >
        {Icon && (
          <IconContainer>
            <Icon
              color={
                importance ? (importance === 'alert' ? theme.global.alert : theme.global.accent) : theme.font.primary
              }
              strokeWidth={1.5}
            />
          </IconContainer>
        )}
        <TextContainer wordBreak={wordBreak} ellipsis={ellipsis}>
          {text || children}
        </TextContainer>
      </StyledBox>
    </div>
  )
}

export default styled(InfoBox)`
  width: 100%;
  margin: 0 auto var(--spacing-4) auto;
  margin-top: var(--spacing-2);
  max-width: ${({ small }) => (small ? '300px' : 'initial')};
  line-height: 1.5em;
`

const IconContainer = styled.div`
  flex: 1;
  display: flex;
  max-width: 100px;

  svg {
    height: 35%;
    width: 35%;
    margin: auto;
  }
`

const TextContainer = styled.div<{ wordBreak?: boolean; ellipsis?: boolean }>`
  padding: 0 var(--spacing-4);
  flex: 2;
  font-weight: var(--fontWeight-medium);
  word-break: ${({ wordBreak }) => (wordBreak ? 'break-all' : 'initial')};

  ${({ ellipsis }) =>
    ellipsis
      ? css`
          overflow: 'hidden';
          textoverflow: 'ellipsis';
        `
      : css`
          overflowwrap: 'anywhere';
        `}
`

const StyledBox = styled(motion.div)<{
  importance?: InfoBoxImportance
  short?: boolean
  contrast?: boolean
  noBorders?: boolean
}>`
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-3) 0;
  height: ${({ short }) => (short ? 'var(--inputHeight)' : 'auto')};
  background-color: ${({ theme, contrast }) => (contrast ? theme.bg.secondary : theme.bg.primary)};

  display: flex;
  border-radius: var(--radius);
  box-shadow: ${({ theme }) => theme.shadow.primary};
  align-items: center;

  ${({ theme, importance, noBorders }) =>
    !noBorders &&
    css`
      border: 1px solid ${importance === 'alert' ? theme.global.alert : theme.border.primary};
    `}
`

const Label = styled(motion.label)`
  display: block;
  width: 100%;
  margin-left: var(--spacing-3);
  margin-bottom: 7px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--fontWeight-medium);
`
