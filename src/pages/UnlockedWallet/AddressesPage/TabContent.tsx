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

import { AnimatePresence, motion, useInView } from 'framer-motion'
import { SearchIcon } from 'lucide-react'
import { ReactNode, useRef } from 'react'
import styled from 'styled-components'

import { fadeIn, fadeInOut } from '@/animations'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Inputs/Input'

interface TabContentProps {
  searchPlaceholder: string
  onSearch: (str: string) => void
  buttonText: string
  onButtonClick: () => void
  newItemPlaceholderText: string
  HeaderMiddleComponent?: ReactNode
  className?: string
}

const TabContent: FC<TabContentProps> = ({
  searchPlaceholder,
  onSearch,
  buttonText,
  onButtonClick,
  newItemPlaceholderText,
  HeaderMiddleComponent,
  children,
  className
}) => {
  const buttonRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(buttonRef)

  return (
    <motion.div {...fadeIn} className={className}>
      <Header>
        <Searchbar placeholder={searchPlaceholder} Icon={SearchIcon} onChange={(e) => onSearch(e.target.value)} />
        {HeaderMiddleComponent}
        <AnimatePresence>
          {!isInView && (
            <ButtonContainer {...fadeInOut}>
              <HeaderButton role="secondary" short onClick={onButtonClick}>
                {buttonText}
              </HeaderButton>
            </ButtonContainer>
          )}
        </AnimatePresence>
      </Header>
      <Cards>
        {children}
        <PlaceholderCard layout isPlaceholder>
          <Text>{newItemPlaceholderText}</Text>
          <motion.div ref={buttonRef}>
            <Button role="secondary" short onClick={onButtonClick}>
              {buttonText}
            </Button>
          </motion.div>
        </PlaceholderCard>
      </Cards>
    </motion.div>
  )
}

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

const PlaceholderCard = styled(Card)`
  padding: 70px 30px 30px 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`

const Text = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  text-align: center;
  line-height: 1.3;
  margin-bottom: 20px;
`
