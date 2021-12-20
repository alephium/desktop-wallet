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

import { motion } from 'framer-motion'
import styled, { css } from 'styled-components'
import tinycolor from 'tinycolor2'
import Tags from '@yaireo/tagify/dist/react.tagify'

export const TextAreaTags = (props: React.ComponentProps<typeof Tags>) => {
  return (
    <TextAreaTagsContainer className={props.className}>
      <StyledTags
        {...props}
        settings={{
          enforceWhitelist: true,
          delimiters: ' ',
          maxTags: 24,
          duplicates: true,
          dropdown: {
            enabled: 1, // show suggestion after 1 typed character
            fuzzySearch: false, // match only suggestions that starts with the typed characters
            position: 'all',
            classname: 'tags-dropdown',
            maxItems: 5,
            highlightFirst: true
          },
          addTagOnBlur: false
        }}
      />
      <div className="tags-dropdown" />
    </TextAreaTagsContainer>
  )
}

const TextAreaTagsContainer = styled(motion.div)`
  width: 100%;
  margin: var(--spacing-3) 0;
  border-radius: var(--radius);
  color: ${({ theme }) => theme.font.secondary};

  .tagify__input:empty::before {
    // Placeholder
    color: ${({ theme }) => theme.font.secondary};
  }
`

const defaultStyle = (isValid?: boolean) => {
  return css`
    background-image: none;
    height: 46px;
    width: 100%;
    border-radius: var(--radius);
    background-color: ${({ theme }) => theme.bg.secondary};
    border: 1px solid ${({ theme }) => theme.border.primary};
    color: ${({ theme }) => theme.font.primary};
    padding: ${isValid ? '0 45px 0 12px' : '0 12px'};
    font-weight: var(--fontWeight-medium);
    font-size: 1em;
    text-align: left;
    font-family: inherit;

    transition: 0.2s ease-out;

    &:focus {
      background-color: ${({ theme }) => theme.bg.primary};
      border: 1px solid ${({ theme }) => theme.global.accent};
    }

    &.error {
      border: 1px solid ${({ theme }) => theme.global.alert};
      background-color: ${({ theme }) => tinycolor(theme.global.alert).setAlpha(0.1).toString()};
    }

    &:disabled {
      background-color: ${({ theme }) => theme.bg.secondary};
      border: 1px solid ${({ theme }) => theme.border.primary};
    }
  `
}

// NOTE: Tags dropdown is styled in GlobalStyles

const StyledTags = styled(Tags)`
  ${defaultStyle(true)}
  height: auto;
  padding: var(--spacing-1);
  line-height: 20px;
  border-radius: var(--radius);
`
