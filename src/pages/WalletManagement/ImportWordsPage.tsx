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

import Tagify, { BaseTagData, ChangeEventData, TagData } from '@yaireo/tagify'
import { useContext, useEffect, useRef, useState } from 'react'
import { walletImport, getStorage } from 'alephium-js'

import { GlobalContext } from '../../App'
import { StepsContext } from '../MultiStepsController'
import { WalletManagementContext } from './WalletManagementContext'
import {
  FooterActionsContainer,
  FloatingPanel,
  PanelContentContainer,
  Section
} from '../../components/PageComponents/PageContainers'
import { Button } from '../../components/Buttons'
import Paragraph from '../../components/Paragraph'
import { bip39Words } from '../../utils/bip39'
import PanelTitle from '../../components/PageComponents/PanelTitle'
import TextAreaTags from '../../components/Inputs/TextAreaTags'

const Storage = getStorage()

const ImportWordsPage = () => {
  const { setWallet, setSnackbarMessage } = useContext(GlobalContext)
  const { password, username } = useContext(WalletManagementContext)
  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const [phrase, setPhrase] = useState<{ value: string }[]>([])
  const allowedWords = useRef(bip39Words.split(' '))
  const [customPlaceholder, setCustomPlaceholder] = useState('Type your 24 words')
  const tagifyRef = useRef<Tagify<TagData> | undefined>()

  const handlePhraseChange = (event: CustomEvent<ChangeEventData<BaseTagData>>) => {
    // Split words where spaces are
    const newPhrase = event.detail.value && JSON.parse(event.detail.value)
    setPhrase(newPhrase || [])
    setCustomPlaceholder(
      newPhrase.length > 0
        ? newPhrase.length === 24
          ? ''
          : `${24 - newPhrase.length} words left`
        : 'Type your 24 words'
    )
  }

  const isNextButtonActive = () => {
    return phrase.length === 24
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
      Storage.save(username, encryptedWallet)

      onButtonNext()
    } catch (e) {
      setSnackbarMessage({ text: (e as Error).toString(), type: 'alert' })
    }
  }

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
          {!isNextButtonActive()
            ? 'Make sure to properly write down the 24 words from your secret phrase. They are the key to your wallet.'
            : "All good? Let's continue!"}
        </Paragraph>
      </PanelContentContainer>
      <FooterActionsContainer>
        <Button secondary onClick={onButtonBack}>
          Cancel
        </Button>
        <Button onClick={handleWalletImport} disabled={!isNextButtonActive()} submit>
          Continue
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default ImportWordsPage
