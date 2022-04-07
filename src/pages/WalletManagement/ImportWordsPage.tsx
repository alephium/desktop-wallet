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

import { getHumanReadableError, getStorage, walletImport } from '@alephium/sdk'
import Tagify, { BaseTagData, ChangeEventData, TagData } from '@yaireo/tagify'
import { useEffect, useRef, useState } from 'react'

import Button from '../../components/Button'
import TextAreaTags from '../../components/Inputs/TextAreaTags'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '../../components/PageComponents/PageContainers'
import PanelTitle from '../../components/PageComponents/PanelTitle'
import Paragraph from '../../components/Paragraph'
import { useGlobalContext } from '../../contexts/global'
import { useStepsContext } from '../../contexts/steps'
import { useWalletContext } from '../../contexts/wallet'
import { bip39Words } from '../../utils/bip39'

const Storage = getStorage()

const ImportWordsPage = () => {
  const { setWallet, setSnackbarMessage } = useGlobalContext()
  const { password, accountName } = useWalletContext()
  const { onButtonBack, onButtonNext } = useStepsContext()

  const [phrase, setPhrase] = useState<{ value: string }[]>([])
  const allowedWords = useRef(bip39Words.split(' '))
  const defaultPlaceholder = 'Type your secret phrase'
  const [customPlaceholder, setCustomPlaceholder] = useState(defaultPlaceholder)
  const tagifyRef = useRef<Tagify<TagData> | undefined>()

  const handlePhraseChange = (event: CustomEvent<ChangeEventData<BaseTagData>>) => {
    // Split words where spaces are
    const newPhrase = event.detail.value && JSON.parse(event.detail.value)
    setPhrase(newPhrase || [])
    setCustomPlaceholder(newPhrase.length > 0 ? `${newPhrase.length} words entered` : defaultPlaceholder)
  }

  useEffect(() => {
    if (tagifyRef.current) {
      tagifyRef.current.DOM.input.setAttribute('data-placeholder', customPlaceholder)
    }
  }, [customPlaceholder])

  const handleWalletImport = () => {
    const formatedPhrase = phrase
      .map((w) => w.value)
      .toString()
      .replace(/,/g, ' ')

    try {
      const wallet = walletImport(formatedPhrase)

      setWallet(wallet)

      const encryptedWallet = wallet.encrypt(password)
      Storage.save(accountName, encryptedWallet)

      onButtonNext()
    } catch (e) {
      setSnackbarMessage({ text: getHumanReadableError(e, 'Error while importing wallet'), type: 'alert' })
    }
  }

  // Alephium's node code uses 12 as the minimal mnemomic length.
  const isNextButtonActive = phrase.length >= 12

  return (
    <FloatingPanel>
      <PanelTitle color="primary">Secret phrase</PanelTitle>
      <PanelContentContainer>
        <Section>
          <TextAreaTags
            tagifyRef={tagifyRef}
            placeholder={phrase.length.toString()}
            whitelist={allowedWords.current}
            onChange={handlePhraseChange}
          />
        </Section>
        <Paragraph secondary centered>
          {!isNextButtonActive
            ? 'Make sure to properly write down the words in a secure location! They are the secret key to your wallet.'
            : "All good? Let's continue!"}
        </Paragraph>
      </PanelContentContainer>
      <FooterActionsContainer>
        <Button secondary onClick={onButtonBack}>
          Cancel
        </Button>
        <Button onClick={handleWalletImport} disabled={!isNextButtonActive} submit>
          Continue
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default ImportWordsPage
