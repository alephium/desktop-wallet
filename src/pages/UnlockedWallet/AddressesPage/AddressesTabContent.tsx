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

import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import AddressEllipsed from '@/components/AddressEllipsed'
import { AddressHash, useAddressesContext } from '@/contexts/addresses'
import { sortAddressList } from '@/utils/addresses'

const AddressesTabContent = () => {
  const navigate = useNavigate()
  const { addresses } = useAddressesContext()
  const { t } = useTranslation('App')

  const navigateToAddressDetailsPage = (addressHash: AddressHash) => () => navigate(`/wallet/addresses/${addressHash}`)

  return (
    <motion.div {...fadeIn}>
      <Addresses>
        {sortAddressList(addresses).map((address) => (
          <AddressCard
            key={address.hash}
            onClick={navigateToAddressDetailsPage(address.hash)}
            onKeyPress={navigateToAddressDetailsPage(address.hash)}
          >
            <InfoSection style={{ backgroundColor: address.settings.color }}>
              <AddressEllipsedStyled addressHash={address.hash} />
              <LastActivity>
                {address.lastUsed ? `${t`Last activity`} ${dayjs(address.lastUsed).fromNow()}` : t`Never used`}
              </LastActivity>
            </InfoSection>
            <TokensSection></TokensSection>
          </AddressCard>
        ))}
      </Addresses>
    </motion.div>
  )
}

export default AddressesTabContent

const Addresses = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
`

const AddressCard = styled.div`
  width: 305px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-huge);
  background-color: ${({ theme }) => theme.bg.primary};
  cursor: pointer;
`

const InfoSection = styled.div`
  padding: 23px 23px 15px 23px;
  border-top-left-radius: var(--radius-huge);
  border-top-right-radius: var(--radius-huge);
`

const TokensSection = styled.div`
  padding: 23px;
  border-top: 1px solid ${({ theme }) => theme.border.primary};
`

const LastActivity = styled.div`
  color: ${({ theme }) => theme.font.secondary}
  font-size: 11px;
  margin-top: 20px;
`

const AddressEllipsedStyled = styled(AddressEllipsed)`
  font-size: 16px;
  font-weight: var(--fontWeight-medium);
`
