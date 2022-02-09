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

import { Info } from 'lucide-react'
import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

import { openInWebBrowser } from '../utils/misc'
import ActionLink from './ActionLink'
import Button from './Button'

interface OperationBoxProps {
  title: string
  Icon: ReactNode
  description: string
  buttonText: string
  onButtonClick: () => void
  infoLink?: string
  className?: string
  placeholder?: boolean
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
  return (
    <div className={className}>
      <Header>
        <Title>{title}</Title>
        <IconWrapper>{Icon}</IconWrapper>
      </Header>
      <Description>{description}</Description>
      <Footer>
        {placeholder ? (
          <ActionLink onClick={onButtonClick}>{buttonText}</ActionLink>
        ) : (
          <Button short onClick={onButtonClick}>
            {buttonText}
          </Button>
        )}
        {infoLink && (
          <ActionLink onClick={() => openInWebBrowser(infoLink)}>
            <InfoIcon size={12} /> More info
          </ActionLink>
        )}
      </Footer>
    </div>
  )
}

const Title = styled.div`
  font-size: 13px;
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: var(--spacing-2);
  min-height: 2rem;
`

const IconWrapper = styled.div``

const Description = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  margin: var(--spacing-4) 0;
`

const InfoIcon = styled(Info)`
  margin-right: var(--spacing-1);
`

const Header = styled.div``

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`

export default styled(OperationBox)`
  padding: var(--spacing-3) var(--spacing-5);
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: var(--radius);
  max-width: 228px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: box-shadow 0.2s ease-out;
  justify-content: space-between;

  &:hover {
    box-shadow: 0 6px 6px rgba(0, 0, 0, 0.5);
  }

  ${({ placeholder }) =>
    placeholder &&
    css`
      justify-content: center;
      background-color: ${({ theme }) => theme.bg.accent};

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
