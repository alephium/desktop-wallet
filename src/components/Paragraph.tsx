// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import { FC } from 'react'
import styled from 'styled-components'

const variants: Variants = {
  hidden: { y: 10, opacity: 0 },
  shown: { y: 0, opacity: 1 }
}

const Paragraph: FC<HTMLMotionProps<'p'>> = ({ children, className, style, ...props }) => {
  return (
    <StyledParagraph variants={variants} className={className} style={style} {...props}>
      {children}
    </StyledParagraph>
  )
}

const StyledParagraph = styled(motion.p)`
  white-space: pre-wrap;
  font-weight: 500;
`

export const CenteredMainParagraph = styled(Paragraph)`
  text-align: center;
`

export const CenteredSecondaryParagraph = styled(Paragraph)`
  text-align: center;
  color: ${({ theme }) => theme.font.secondary};
`

export default Paragraph
