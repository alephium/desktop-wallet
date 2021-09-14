import styled from 'styled-components'
import { motion } from 'framer-motion'

export interface TabItem {
  value: string
  label: string
}

//const indicatorMargin =

const TabBar = ({
  tabItems,
  onTabChange,
  activeTab
}: {
  tabItems: TabItem[]
  onTabChange: (tab: TabItem) => void
  activeTab: TabItem
}) => {
  return (
    <Wrapper>
      <TabBarContainer>
        <TabSelector
          animate={{
            x: `${(tabItems.findIndex((t) => t.value === activeTab.value) / (tabItems.length - 1)) * 100}%`
          }}
          transition={{ duration: 0.2 }}
          style={{ width: `${100 / tabItems.length}%` }}
        />
        <TabBarContent>
          {tabItems.map((i) => {
            const isActive = activeTab.value === i.value
            return (
              <TabContainer key={i.value}>
                <Tab onClick={() => onTabChange(i)} isActive={isActive}>
                  {i.label}
                </Tab>
              </TabContainer>
            )
          })}
        </TabBarContent>
      </TabBarContainer>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  margin: 10px 0 25px 0;
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: ${({ theme }) => theme.bg.primary};
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
`

const TabBarContainer = styled.div`
  width: 100%;
  border-radius: 7px;
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
  font-weight: 600;
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
  border-radius: 7px;
  flex: 1;
  background-color: ${({ theme }) => theme.global.accent};
  z-index: -1;
`

export default TabBar
