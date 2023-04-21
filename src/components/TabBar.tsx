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

import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import ActionLink from '@/components/ActionLink'

export interface TabItem {
  value: string
  label: string
}

export interface TabBarProps {
  items: TabItem[]
  onTabChange: (tab: TabItem) => void
  activeTab: TabItem
  linkText?: string
  onLinkClick?: () => void
  TabComponent?: typeof Tab
  className?: string
}

const TabBar = ({
  items,
  onTabChange,
  activeTab,
  linkText,
  onLinkClick,
  TabComponent = Tab,
  className
}: TabBarProps) => {
  const { t } = useTranslation()

  return (
    <div className={className} role="tablist" aria-label={t`Tab navigation`}>
      {items.map((item) => {
        const isActive = activeTab.value === item.value

        return (
          <TabComponent
            key={item.value}
            onClick={() => onTabChange(item)}
            onKeyPress={() => onTabChange(item)}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            isActive={isActive}
          >
            {item.label}
          </TabComponent>
        )
      })}
      {linkText && onLinkClick && (
        <ActionLinkStyled onClick={onLinkClick} Icon={ChevronRight}>
          {linkText}
        </ActionLinkStyled>
      )}
    </div>
  )
}

export default styled(TabBar)`
  display: flex;
  max-height: 60px;
`

export const Tab = styled.div<{ isActive: boolean }>`
  flex: 1;
  min-width: 50px;
  text-align: center;
  padding: 16px 36px;
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg.background1 : 'transparent')};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-bottom: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: -1px;

  ${({ isActive, theme }) =>
    isActive
      ? css`
          color: ${theme.font.primary};
        `
      : css`
          color: ${theme.font.tertiary};
        `}

  &:not(:first-child) {
    border-left: none;
  }

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`

const ActionLinkStyled = styled(ActionLink)`
  margin-left: auto;
  margin-right: 20px;
`
