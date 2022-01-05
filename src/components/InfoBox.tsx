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
import { LucideProps } from 'lucide-react'
import styled, { css, useTheme } from 'styled-components'

import { sectionChildrenVariants } from './PageComponents/PageContainers'

type InfoBoxImportance = 'accent' | 'alert'

interface InfoBoxProps {
  text: string
  Icon?: (props: LucideProps) => JSX.Element
  label?: string
  importance?: InfoBoxImportance
  className?: string
  ellipsis?: boolean
  wordBreak?: boolean
  onClick?: () => void
  small?: boolean
  short?: boolean
}

const InfoBox = ({
  Icon,
  text,
  label,
  importance,
  className,
  ellipsis,
  wordBreak,
  onClick,
  small,
  short
}: InfoBoxProps) => {
  const theme = useTheme()

  return (
    <BoxContainer className={className} onClick={onClick} small={small}>
      {label && <Label variants={sectionChildrenVariants}>{label}</Label>}
      <StyledBox variants={sectionChildrenVariants} importance={importance} short={short}>
        {Icon && (
          <IconContainer>
            <Icon color={importance ? theme.global.accent : theme.global.accent} strokeWidth={1.5} />
          </IconContainer>
        )}
        <TextContainer wordBreak={wordBreak} ellipsis={ellipsis}>
          {text}
        </TextContainer>
      </StyledBox>
    </BoxContainer>
  )
}

const BoxContainer = styled.div<{ small?: boolean }>`
  width: 100%;
  margin: 0 auto var(--spacing-4) auto;
  margin-top: var(--spacing-2);
  max-width: ${({ small }) => (small ? '300px' : 'initial')};
`

const IconContainer = styled.div`
  flex: 1;
  display: flex;
  max-width: 100px;

  svg {
    height: 30%;
    width: 30%;
    margin: auto;
  }
`

const TextContainer = styled.p<{ wordBreak?: boolean; ellipsis?: boolean }>`
  padding: 0 var(--spacing-4);
  flex: 2;
  font-weight: var(--fontWeight-medium);
  word-break: ${({ wordBreak }) => (wordBreak ? 'break-all' : 'initial')};

  ${({ ellipsis }) => {
    return ellipsis
      ? css`
          overflow: 'hidden';
          textoverflow: 'ellipsis';
        `
      : css`
          overflowwrap: 'anywhere';
        `
  }}
`

const StyledBox = styled(motion.div)<{ importance?: InfoBoxImportance; short?: boolean }>`
  padding: var(--spacing-2) var(--spacing-4) var(--spacing-2) 0;
  height: ${({ short }) => (short ? 'var(--inputHeight)' : 'auto')};
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme, importance }) => (importance === 'alert' ? theme.global.alert : theme.border.primary)};
  display: flex;
  border-radius: var(--radius);
  box-shadow: 0 2px 2px var(--color-shadow-5);
  align-items: center;
`

const Label = styled(motion.label)`
  display: block;
  width: 100%;
  margin-left: var(--spacing-3);
  margin-bottom: 7px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--fontWeight-medium);
`

export default InfoBox
