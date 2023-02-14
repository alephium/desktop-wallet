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

import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import { TabBarProps } from '@/components/TabBar'

interface TableTabBarProps extends TabBarProps {
  linkText?: string
  onLinkClick?: () => void
}

const TableTabBar = ({ items, onTabChange, activeTab, className, linkText, onLinkClick }: TableTabBarProps) => {
  const { t } = useTranslation()

  return (
    <div className={className} role="tablist" aria-label={t('Tab navigation')}>
      {items.map((item, index) => {
        const isActive = activeTab.value === item.value

        return (
          <Tab
            key={item.value}
            onClick={() => onTabChange(item)}
            onKeyPress={() => onTabChange(item)}
            role="tab"
            tabIndex={0}
            aria-selected={isActive}
            isActive={isActive}
          >
            {item.label}
          </Tab>
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

export default styled(TableTabBar)`
  display: flex;
  justify-content: flex-start;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
`

const Tab = styled.div<{ isActive: boolean }>`
  min-width: 60px;
  text-align: center;
  padding: 22px 20px;
  border-right: 1px solid ${({ theme }) => theme.border.secondary};
  cursor: pointer;

  ${({ isActive, theme }) =>
    isActive
      ? css`
          color: ${theme.font.primary};
          background-color: ${theme.bg.primary};
          margin-bottom: -1px;
        `
      : css`
          color: ${theme.font.tertiary};
          background-color: ${theme.bg.secondary};
        `}

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`

const ActionLinkStyled = styled(ActionLink)`
  margin-left: auto;
  margin-right: 20px;
`
