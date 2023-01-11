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

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import Button from '@/components/Button'
import { useAddressesContext } from '@/contexts/addresses'
import NewAddressModal from '@/modals/NewAddressModal'
import { sortAddressList } from '@/utils/addresses'

import AddressCard from './AddressCard'

const AddressesTabContent = () => {
  const { addresses } = useAddressesContext()
  const { t } = useTranslation()

  const [isGenerateNewAddressModalOpen, setIsGenerateNewAddressModalOpen] = useState(false)

  return (
    <motion.div {...fadeIn}>
      <Addresses>
        {sortAddressList(addresses).map((address) => (
          <AddressCard hash={address.hash} key={address.hash} />
        ))}
        <Placeholder>
          <Text>Addresses allow you to organise your funds. You can create as many as you want!</Text>
          <Button mode="secondary" short onClick={() => setIsGenerateNewAddressModalOpen(true)}>
            + {t('New address')}
          </Button>
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

const Addresses = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
`

const Placeholder = styled.div`
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
