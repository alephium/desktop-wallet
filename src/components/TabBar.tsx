import styled from 'styled-components'

export interface TabItem {
  value: string
  label: string
}

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
    <TabBarContainer>
      {tabItems.map((i) => {
        return (
          <Tab key={i.value} onClick={() => onTabChange(i)} isActive={activeTab.value === i.value}>
            {i.label}
          </Tab>
        )
      })}
    </TabBarContainer>
  )
}

const TabBarContainer = styled.div`
  width: 100%;
  display: flex;
  border-radius: 14px;
  padding: 8px;
  margin: 15px 0 20px 0;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const Tab = styled.div<{ isActive: boolean }>`
  flex: 1;
  text-align: center;
  padding: 8px;
  border-radius: 7px;

  background-color: ${({ theme, isActive }) => (isActive ? theme.global.accent : 'transparent')};
  color: ${({ theme, isActive }) => (isActive ? theme.font.contrast : theme.font.secondary)};
`

export default TabBar
