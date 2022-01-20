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

import { ReactNode } from 'react'
import styled from 'styled-components'

interface InlineLabelValueInputProps {
  label: string
  InputComponent: ReactNode
  description?: string
  className?: string
}

const InlineLabelValueInput = ({ label, InputComponent, description, className }: InlineLabelValueInputProps) => (
  <KeyValueInputContainer className={className}>
    <KeyContainer>
      {label}
      {description && <DescriptionContainer>{description}</DescriptionContainer>}
    </KeyContainer>
    <InputContainer>{InputComponent}</InputContainer>
  </KeyValueInputContainer>
)

const KeyValueInputContainer = styled.div`
  display: flex;
  padding: var(--spacing-4) var(--spacing-3);
  gap: var(--spacing-4);
  width: 100%;
`

const KeyContainer = styled.div`
  flex: 4;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-1);
`

const DescriptionContainer = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`

export default InlineLabelValueInput
