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

import Tags from '@yaireo/tagify/dist/react.tagify'
import { motion } from 'framer-motion'
import { ComponentProps } from 'react'
import styled from 'styled-components'

import { inputDefaultStyle } from '.'

const TextAreaTags = (props: ComponentProps<typeof Tags>) => (
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
        addTagOnBlur: false,
        editTags: false
      }}
    />
    <div className="tags-dropdown" />
  </TextAreaTagsContainer>
)

export default TextAreaTags

const TextAreaTagsContainer = styled(motion.div)`
  width: 100%;
  margin: var(--spacing-3) 0;
  border-radius: var(--radius-small);
  color: ${({ theme }) => theme.font.secondary};

  .tagify__input:empty::before {
    // Placeholder
    color: ${({ theme }) => theme.font.secondary};
  }

  // Remove effects on hover
  .tagify__tag:focus div::before,
  .tagify__tag:hover:not([readonly]) div::before {
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
  }
`

// NOTE: Tags dropdown is styled in GlobalStyles

const StyledTags = styled(Tags)`
  ${inputDefaultStyle(true)}
  height: auto;
  padding: var(--spacing-1);
  line-height: 20px;
  border-radius: var(--radius-small);
`
