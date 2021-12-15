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
import { HorizontalDivider, SectionContent } from '../../components/PageComponents'
import AccountRemovalModal from './AccountRemovalModal'
import SecretPhraseModal from './SecretPhraseModal'

const Storage = getStorage()

const AccountsSettingsSection = () => {
  const { currentUsername, setWallet } = useContext(GlobalContext)
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
      <SectionContent>
        {isDisplayingSecretModal && <SecretPhraseModal onClose={() => setIsDisplayingSecretModal(false)} />}

        {isDisplayingRemoveModal && (
          <AccountRemovalModal
            onClose={() => setIsDisplayingRemoveModal(false)}
            onAccountRemove={handleRemoveAccount}
          />
        )}

        <Button secondary alert onClick={openSecretPhraseModal}>
          Show your secret phrase
        </Button>
        <Button secondary onClick={handleLogout}>
          Lock wallet
        </Button>
        <HorizontalDivider />
        <Button alert onClick={openRemoveAccountModal}>
          Remove account
        </Button>
      </SectionContent>
    </>
  )
}

export default AccountsSettingsSection
