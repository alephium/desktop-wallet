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
        <TabBarContent>
          <TabSelector
            animate={{
              x: `${(tabItems.findIndex((t) => t.value === activeTab.value) / (tabItems.length - 1)) * 100}%`
            }}
            transition={{ duration: 0.2 }}
            style={{ width: `${100 / tabItems.length}%` }}
          />
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
  padding-bottom: 8px;
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: ${({ theme }) => theme.bg.primary};
`

const TabBarContainer = styled.div`
  width: 100%;
  padding: 8px;
  border-radius: 7px;
  background-color: ${({ theme }) => theme.bg.secondary};
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
`

const Tab = styled.div<{ isActive: boolean }>`
  text-align: center;
  padding: 8px;
  color: ${({ theme, isActive }) => (isActive ? theme.font.contrastPrimary : theme.font.secondary)};
  z-index: 1;
  cursor: pointer;
`

const TabSelector = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 7px;
  flex: 1;
  background-color: ${({ theme }) => theme.global.accent};
  z-index: -1;
`

export default TabBar
