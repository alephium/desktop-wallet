// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { useContext, useState } from 'react'
import { getStorage } from 'alephium-js'

import { GlobalContext } from '../../App'
import { Button } from '../../components/Buttons'
import { BoxContainer, Section } from '../../components/PageComponents/PageContainers'
import AccountRemovalModal from './AccountRemovalModal'
import SecretPhraseModal from './SecretPhraseModal'
import InfoBox from '../../components/InfoBox'
import styled from 'styled-components'
import { MoreVertical } from 'lucide-react'
import { HorizontalDivider } from '../../components/PageComponents/HorizontalDivider'

const Storage = getStorage()

const AccountsSettingsSection = () => {
  const { usernames, currentUsername, wallet, setWallet } = useContext(GlobalContext)
  const [isDisplayingSecretModal, setIsDisplayingSecretModal] = useState(false)
  const [isDisplayingRemoveModal, setIsDisplayingRemoveModal] = useState(false)

  const openSecretPhraseModal = () => {
    setIsDisplayingSecretModal(true)
  }

  const openRemoveAccountModal = () => {
    setIsDisplayingRemoveModal(true)
  }

  const handleLogout = () => {
    setWallet(undefined)
  }

  const handleRemoveAccount = () => {
    Storage.remove(currentUsername)
    handleLogout()
  }

  return (
    <>
      {isDisplayingSecretModal && <SecretPhraseModal onClose={() => setIsDisplayingSecretModal(false)} />}

      {isDisplayingRemoveModal && (
        <AccountRemovalModal onClose={() => setIsDisplayingRemoveModal(false)} onAccountRemove={handleRemoveAccount} />
      )}
      <Section align="left">
        <h2>Account list</h2>
        <BoxContainer>
          {usernames.map((n) => {
            return <AccountItem key={n} accountName={n} isCurrent={n === currentUsername} />
          })}
        </BoxContainer>
      </Section>
      {wallet && (
        <>
          <HorizontalDivider />
          <Section align="left">
            <h2>Current account</h2>
            <InfoBox label="Account name" text={currentUsername} />
          </Section>
          <Section>
            <Button secondary onClick={handleLogout}>
              Lock current account
            </Button>
            <Button secondary alert onClick={openSecretPhraseModal}>
              Show your secret phrase
            </Button>
            <Button alert onClick={openRemoveAccountModal}>
              Remove current account
            </Button>
          </Section>
        </>
      )}
    </>
  )
}

const AccountItem = ({ accountName, isCurrent }: { accountName: string; isCurrent: boolean }) => {
  return (
    <AccountItemContainer>
      <AccountName>
        {accountName}
        {isCurrent && <CurrentAccountLabel> (current)</CurrentAccountLabel>}
      </AccountName>
      <AccountOptionButton squared transparent>
        <MoreVertical />
      </AccountOptionButton>
    </AccountItemContainer>
  )
}

const AccountItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-2);

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  }
`

const AccountName = styled.div`
  flex: 1;
`

const CurrentAccountLabel = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const AccountOptionButton = styled(Button)``

export default AccountsSettingsSection
