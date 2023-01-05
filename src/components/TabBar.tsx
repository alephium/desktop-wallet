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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

export interface TabItem {
  value: string
  label: string
}

interface TabBarProps {
  items: TabItem[]
  onTabChange: (tab: TabItem) => void
  activeTab: TabItem
  className?: string
}

const TabBar = ({ items, onTabChange, activeTab, className }: TabBarProps) => {
  const { t } = useTranslation('App')

  return (
    <div className={className} role="tablist" aria-label={t`Tab navigation`}>
      {items.map((item) => {
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
    </div>
  )
}

export default styled(TabBar)`
  margin-left: 22px;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
`

const Tab = styled.div<{ isActive: boolean }>`
  min-width: 50px;
  text-align: center;
  padding: 16px 36px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-top-left-radius: var(--radius-big);
  border-top-right-radius: var(--radius-big);
  border-bottom: none;
  cursor: pointer;

  color: ${({ isActive, theme }) => (isActive ? theme.font.primary : theme.font.tertiary)};
  background-color: ${({ isActive, theme }) => (isActive ? theme.bg.secondary : theme.bg.background1)};

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`
