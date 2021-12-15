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

import { getStorage, Wallet, walletOpen } from 'alephium-js'
import { Edit3 } from 'lucide-react'
import { useContext, useState, ChangeEvent } from 'react'
import styled from 'styled-components'

import { GlobalContext } from '../../App'
import { Button } from '../../components/Buttons'
import { InfoBox } from '../../components/InfoBox'
import { Input } from '../../components/Inputs'
import Modal from '../../components/Modal'
import { HorizontalDivider, SectionContent } from '../../components/PageComponents'
import { CenteredSecondaryParagraph } from '../../components/Paragraph'
import AccountRemovalModal from './AccountRemovalModal'

const Storage = getStorage()

const AccountsSettingsSection = () => {
  const { currentUsername, setSnackbarMessage, setWallet } = useContext(GlobalContext)
  const [isDisplayingSecretModal, setIsDisplayingSecretModal] = useState(false)
  const [isDisplayingRemoveModal, setIsDisplayingRemoveModal] = useState(false)
  const [isDisplayingPhrase, setIsDisplayingPhrase] = useState(false)
  const [decryptedWallet, setDecryptedWallet] = useState<Wallet>()
  const [typedPassword, setTypedPassword] = useState('')

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTypedPassword(e.target.value)
  }

  const handlePasswordVerification = async (callback: () => void) => {
    const walletEncrypted = Storage.load(currentUsername)

    try {
      const plainWallet = await walletOpen(typedPassword, walletEncrypted)

      if (plainWallet) {
        setDecryptedWallet(plainWallet)
        callback()
      }
    } catch (e) {
      setSnackbarMessage({ text: 'Invalid password', type: 'alert' })
    }
  }

  const openSecretPhraseModal = () => {
    setTypedPassword('')
    setIsDisplayingSecretModal(true)
  }

  const openRemoveAccountModal = () => {
    setTypedPassword('')
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
        {isDisplayingSecretModal && (
          <Modal title="Secret phrase" onClose={() => setIsDisplayingSecretModal(false)} focusMode>
            {!isDisplayingPhrase ? (
              <div>
                <SectionContent>
                  <Input value={typedPassword} placeholder="Password" type="password" onChange={handlePasswordChange} />
                  <CenteredSecondaryParagraph>
                    Type your password above to show your 24 words phrase.
                  </CenteredSecondaryParagraph>
                </SectionContent>
                <SectionContent>
                  <Button onClick={() => handlePasswordVerification(() => setIsDisplayingPhrase(true))}>Show</Button>
                </SectionContent>
              </div>
            ) : (
              <SectionContent>
                <InfoBox
                  text={'Carefully note the 24 words. They are the keys to your wallet.'}
                  Icon={Edit3}
                  importance="alert"
                />
                <PhraseBox>{decryptedWallet?.mnemonic || 'No mnemonic was stored along with this wallet'}</PhraseBox>
              </SectionContent>
            )}
          </Modal>
        )}

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

const PhraseBox = styled.div`
  width: 100%;
  padding: var(--spacing-4);
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: var(--fontWeight-semiBold);
  background-color: ${({ theme }) => theme.global.alert};
  border-radius: var(--radius-big);
  margin-bottom: var(--spacing-4);
`

export default AccountsSettingsSection
