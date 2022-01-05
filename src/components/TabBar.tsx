/*
Copyright 2018 - 2021 The Alephium Authors
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

import { motion } from 'framer-motion'
import styled from 'styled-components'

export interface TabItem {
  value: string
  label: string
}

interface TabBarProps {
  tabItems: TabItem[]
  onTabChange: (tab: TabItem) => void
  activeTab: TabItem
}

const TabBar = ({ tabItems, onTabChange, activeTab }: TabBarProps) => {
  return (
    <Wrapper>
      <TabBarContainer>
        <TabSelector
          animate={{ x: `${tabItems.findIndex((t) => t.value === activeTab.value) * 100}%` }}
          transition={{ duration: 0.2 }}
          style={{ width: `${100 / tabItems.length}%` }}
        />
        <TabBarContent>
          {tabItems.map((i) => (
            <TabContainer key={i.value}>
              <Tab onClick={() => onTabChange(i)} isActive={activeTab.value === i.value}>
                {i.label}
              </Tab>
            </TabContainer>
          ))}
        </TabBarContent>
      </TabBarContainer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin: var(--spacing-2) 0;
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: ${({ theme }) => theme.bg.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
`

const TabBarContainer = styled.div`
  width: 100%;
  border-radius: var(--radius);
  height: 40px;
`

const TabBarContent = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
`

const TabContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
`

const Tab = styled.div<{ isActive: boolean }>`
  flex: 1;
  text-align: center;
  padding: 8px;
  color: ${({ theme, isActive }) => (isActive ? theme.font.primary : theme.font.secondary)};
  font-weight: var(--fontWeight-semiBold);
  z-index: 1;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.font.primary};
  }
`

const TabSelector = styled(motion.div)`
  position: absolute;
  bottom: 0;
  height: 2px;
  border-radius: var(--radius);
  flex: 1;
  background-color: ${({ theme }) => theme.global.accent};
  z-index: -1;
`

export default TabBar
