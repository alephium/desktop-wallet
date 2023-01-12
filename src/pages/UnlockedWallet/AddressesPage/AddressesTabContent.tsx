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
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn, fadeInOut } from '@/animations'
import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'
import Toggle from '@/components/Inputs/Toggle'
import { useAddressesContext } from '@/contexts/addresses'
import NewAddressModal from '@/modals/NewAddressModal'
import { sortAddressList } from '@/utils/addresses'

import AddressCard from './AddressCard'

const AddressesTabContent = () => {
  const { addresses } = useAddressesContext()
  const { t } = useTranslation()
  const newAddressButtonRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(newAddressButtonRef)

  const [isGenerateNewAddressModalOpen, setIsGenerateNewAddressModalOpen] = useState(false)
  const [searchResults, setSearchResults] = useState(addresses)
  const [emptyAddressesToggleResults, setEmptyAddressesToggleResults] = useState(addresses)
  const [hideEmptyAddresses, setHideEmptyAddresses] = useState(false)

  const visibleAddresses = searchResults.filter((address1) => emptyAddressesToggleResults.includes(address1))

  const handleSearch = (searchInput: string) => {
    if (searchInput.length < 2) {
      setSearchResults(addresses)
      return
    }

    const input = searchInput.toLowerCase()
    // TODO: Include tokens in search
    setSearchResults(
      addresses.filter(
        (address) => address.settings.label?.toLowerCase().includes(input) || address.hash.toLowerCase().includes(input)
      )
    )
  }

  const handleHideEmptyAddressesToggle = (toggle: boolean) => {
    setHideEmptyAddresses(toggle)
    // TODO: Include tokens in filtering empty addresses
    setEmptyAddressesToggleResults(toggle ? addresses.filter((address) => address.details.balance !== '0') : addresses)
  }

  return (
    <motion.div {...fadeIn}>
      <Header>
        <Searchbar
          placeholder={t('Search for label, a hash or an asset...')}
          Icon={SearchIcon}
          onChange={(e) => handleSearch(e.target.value)}
        />
        <HideEmptyAddressesToggle>
          <ToggleText>{t('Hide empty addresses')}</ToggleText>
          <Toggle
            onToggle={handleHideEmptyAddressesToggle}
            label={t('Hide empty addresses')}
            toggled={hideEmptyAddresses}
          />
        </HideEmptyAddressesToggle>
        <AnimatePresence>
          {!isInView && (
            <ButtonContainer {...fadeInOut}>
              <NewAddressHeaderButton role="secondary" short onClick={() => setIsGenerateNewAddressModalOpen(true)}>
                + {t('New address')}
              </NewAddressHeaderButton>
            </ButtonContainer>
          )}
        </AnimatePresence>
      </Header>
      <Addresses>
        {sortAddressList(visibleAddresses).map((address) => (
          <AddressCard hash={address.hash} key={address.hash} />
        ))}
        <Placeholder layout>
          <Text>{t('Addresses allow you to organise your funds. You can create as many as you want!')}</Text>
          <motion.div ref={newAddressButtonRef}>
            <Button role="secondary" short onClick={() => setIsGenerateNewAddressModalOpen(true)}>
              + {t('New address')}
            </Button>
          </motion.div>
        </Placeholder>
      </Addresses>
      <AnimatePresence>
        {isGenerateNewAddressModalOpen && (
          <NewAddressModal
            singleAddress
            title={t('New address')}
            onClose={() => setIsGenerateNewAddressModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AddressesTabContent

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

const Addresses = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
`

const Placeholder = styled(motion.div)`
  width: 222px;
  border-radius: var(--radius-huge);
  border: 1px dashed ${({ theme }) => theme.border.primary};
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

const HideEmptyAddressesToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 250px;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 10px 18px 10px 22px;
  border-radius: var(--radius-medium);
`

const ToggleText = styled.div`
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`

const NewAddressHeaderButton = styled(Button)`
  margin: 0;
  margin-left: auto;
`

const ButtonContainer = styled(motion.div)`
  margin-left: auto;
`
