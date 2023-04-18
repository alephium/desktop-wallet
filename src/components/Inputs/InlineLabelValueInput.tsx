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

import { Info } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import { openInWebBrowser } from '@/utils/misc'

interface InlineLabelValueInputProps {
  label: string
  InputComponent: ReactNode
  description?: string
  moreInfoLink?: string
  className?: string
}

const InlineLabelValueInput = ({
  label,
  InputComponent,
  description,
  moreInfoLink,
  className
}: InlineLabelValueInputProps) => {
  const { t } = useTranslation()

  return (
    <KeyValueInputContainer className={className}>
      <KeyContainer>
        <Label>{label}</Label>
        {description && <DescriptionContainer>{description}</DescriptionContainer>}
        {moreInfoLink && (
          <ActionLinkStyled onClick={() => openInWebBrowser(moreInfoLink)}>
            <Info size={12} /> {t('More info')}
          </ActionLinkStyled>
        )}
      </KeyContainer>
      <InputContainer>{InputComponent}</InputContainer>
    </KeyValueInputContainer>
  )
}

export default InlineLabelValueInput

const KeyValueInputContainer = styled.div`
  display: flex;
  padding: var(--spacing-4) var(--spacing-3);
  gap: var(--spacing-8);
  width: 100%;
`

const KeyContainer = styled.div`
  flex: 2.5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--spacing-1);
`

const Label = styled.label`
  font-weight: var(--fontWeight-semiBold);
`

const DescriptionContainer = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
`

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
`

const ActionLinkStyled = styled(ActionLink)`
  gap: 0.3em;
`
