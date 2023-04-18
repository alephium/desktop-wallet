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

import { motion } from 'framer-motion'
import { SearchIcon } from 'lucide-react'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { fadeIn, fadeInOut } from '@/animations'
import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'

interface TabContentProps {
  searchPlaceholder: string
  onSearch: (str: string) => void
  buttonText: string
  onButtonClick: () => void
  HeaderMiddleComponent?: ReactNode
  className?: string
}

const TabContent: FC<TabContentProps> = ({
  searchPlaceholder,
  onSearch,
  buttonText,
  onButtonClick,
  HeaderMiddleComponent,
  children,
  className
}) => (
  <motion.div {...fadeIn} className={className}>
    <Header>
      <Searchbar placeholder={searchPlaceholder} Icon={SearchIcon} onChange={(e) => onSearch(e.target.value)} />
      {HeaderMiddleComponent}
      <ButtonContainer {...fadeInOut}>
        <HeaderButton variant="faded" short onClick={onButtonClick}>
          {buttonText}
        </HeaderButton>
      </ButtonContainer>
    </Header>
    <Cards>{children}</Cards>
  </motion.div>
)

export default TabContent

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 44px;
  gap: 28px;
`

const Searchbar = styled(Input)`
  max-width: 364px;
  margin: 0;

  svg {
    color: ${({ theme }) => theme.font.tertiary};
  }
`

const Cards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
`

const HeaderButton = styled(Button)`
  margin: 0;
  margin-left: auto;
`

const ButtonContainer = styled(motion.div)`
  margin-left: auto;
`
