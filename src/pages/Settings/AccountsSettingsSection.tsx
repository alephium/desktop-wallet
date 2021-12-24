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

import { getStorage } from 'alephium-js'
import { Trash } from 'lucide-react'
import { useState } from 'react'
import styled from 'styled-components'

import { Button } from '../../components/Buttons'
import InfoBox from '../../components/InfoBox'
import { HorizontalDivider } from '../../components/PageComponents/HorizontalDivider'
import { BoxContainer, Section } from '../../components/PageComponents/PageContainers'
import { useGlobalContext } from '../../contexts/global'
import AccountRemovalModal from './AccountRemovalModal'
import SecretPhraseModal from './SecretPhraseModal'

const Storage = getStorage()

const AccountsSettingsSection = () => {
  const { currentUsername, wallet, lockWallet } = useGlobalContext()
  const [isDisplayingSecretModal, setIsDisplayingSecretModal] = useState(false)
  const [accountToRemove, setAccountToRemove] = useState<string>('')

  const usernames = Storage.list()

  const openRemoveAccountModal = (accountName: string) => {
    setAccountToRemove(accountName)
  }

  const handleRemoveAccount = (accountName: string) => {
    Storage.remove(accountName)

    accountName === currentUsername ? lockWallet() : setAccountToRemove('')
  }

  const openSecretPhraseModal = () => {
    setIsDisplayingSecretModal(true)
  }

  return (
    <>
      {isDisplayingSecretModal && <SecretPhraseModal onClose={() => setIsDisplayingSecretModal(false)} />}

      {accountToRemove && (
        <AccountRemovalModal
          accountName={accountToRemove}
          onClose={() => setAccountToRemove('')}
          onAccountRemove={() => handleRemoveAccount(accountToRemove)}
        />
      )}
      <Section align="flex-start">
        <h2>Account list ({usernames.length})</h2>
        <BoxContainer>
          {usernames.map((n) => {
            return (
              <AccountItem
                key={n}
                accountName={n}
                isCurrent={n === currentUsername}
                onAccountDelete={(name) => setAccountToRemove(name)}
              />
            )
          })}
        </BoxContainer>
      </Section>
      {wallet && (
        <>
          <HorizontalDivider />
          <Section align="flex-start">
            <h2>Current account</h2>
            <InfoBox label="Account name" text={currentUsername} />
          </Section>
          <Section>
            <Button secondary onClick={lockWallet}>
              Lock current account
            </Button>
            <Button secondary alert onClick={openSecretPhraseModal}>
              Show your secret phrase
            </Button>
            <Button alert onClick={() => openRemoveAccountModal(currentUsername)}>
              Remove current account
            </Button>
          </Section>
        </>
      )}
    </>
  )
}

const AccountItem = ({
  accountName,
  isCurrent,
  onAccountDelete
}: {
  accountName: string
  isCurrent: boolean
  onAccountDelete: (accountName: string) => void
}) => {
  const [isShowingDeleteButton, setIsShowingDeleteButton] = useState(false)

  return (
    <AccountItemContainer
      onMouseEnter={() => setIsShowingDeleteButton(true)}
      onMouseLeave={() => setIsShowingDeleteButton(false)}
    >
      <AccountName>
        {accountName}
        {isCurrent && <CurrentAccountLabel> (current)</CurrentAccountLabel>}
      </AccountName>
      {isShowingDeleteButton && (
        <AccountDeleteButton squared transparent onClick={() => onAccountDelete(accountName)}>
          <Trash size={15} />
        </AccountDeleteButton>
      )}
    </AccountItemContainer>
  )
}

const AccountItemContainer = styled.div`
  display: flex;
  align-items: center;
  height: var(--inputHeight);
  padding: 0 var(--spacing-2);

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

const AccountDeleteButton = styled(Button)``

export default AccountsSettingsSection
