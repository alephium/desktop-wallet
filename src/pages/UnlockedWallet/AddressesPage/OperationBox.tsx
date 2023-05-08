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

import { colord } from 'colord'
import { Info } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Button from '@/components/Button'
import { openInWebBrowser } from '@/utils/misc'

interface OperationBoxProps {
  title: string
  Icon: ReactNode
  description: string
  buttonText: string
  onButtonClick: () => void
  infoLink?: string
  placeholder?: boolean
  className?: string
}

const OperationBox = ({
  className,
  title,
  Icon,
  description,
  buttonText,
  onButtonClick,
  infoLink,
  placeholder
}: OperationBoxProps) => {
  const { t } = useTranslation()

  return (
    <div className={className}>
      <IconWrapper>{Icon}</IconWrapper>
      <div>
        <Title>{title}</Title>
        <Description>{description}</Description>
      </div>
      <Footer>
        {placeholder ? (
          <ActionLink onClick={onButtonClick}>{buttonText}</ActionLink>
        ) : (
          <Button short wide onClick={onButtonClick}>
            {buttonText}
          </Button>
        )}
        {infoLink && (
          <ActionLink onClick={() => openInWebBrowser(infoLink)}>
            <InfoIcon size={12} /> {t('More info')}
          </ActionLink>
        )}
      </Footer>
    </div>
  )
}

export default styled(OperationBox)`
  padding: var(--spacing-3) var(--spacing-5);
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-huge);
  display: flex;
  align-items: center;
  transition: box-shadow 0.1s ease-out;
  justify-content: space-between;
  gap: 20px;

  ${({ placeholder }) =>
    placeholder &&
    css`
      justify-content: center;
      background-color: ${({ theme }) => theme.bg.accent};
      border: 1px solid ${({ theme }) => colord(theme.bg.accent).alpha(0.3).toHex()};

      ${IconWrapper} {
        order: -1;
      }
      ${Title} {
        color: ${({ theme }) => theme.font.secondary};
        margin-top: var(--spacing-2);
        margin-bottom: 0;
      }
      ${Description} {
        margin: var(--spacing-3) 0;
      }
    `}
`

const Title = styled.div`
  font-size: 13px;
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: var(--spacing-2);
`

const IconWrapper = styled.div``

const Description = styled.div`
  color: ${({ theme }) => theme.font.secondary};
`

const InfoIcon = styled(Info)`
  margin-right: var(--spacing-1);
`

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
`
