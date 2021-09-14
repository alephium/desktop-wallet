import Tagify, { BaseTagData, ChangeEventData, TagData } from '@yaireo/tagify'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { TextAreaTags } from '../../components/Inputs'
import {
  FooterActions,
  MainPanel,
  PanelContainer,
  PanelContent,
  PanelTitle,
  SectionContent
} from '../../components/PageComponents'
import { bip39Words } from '../../utils/bip39'
import { Button } from '../../components/Buttons'
import { StepsContext } from '../MultiStepsController'
import { CenteredSecondaryParagraph } from '../../components/Paragraph'
import { walletImport, getStorage } from 'alephium-js'
import { GlobalContext } from '../../App'
import { WalletManagementContext } from './WalletManagementContext'
import { isHTTPError } from '../../utils/api'

const Storage = getStorage()

const ImportWordsPage = () => {
  const { networkId, setWallet, setSnackbarMessage } = useContext(GlobalContext)
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
      const wallet = walletImport(formatedPhrase, networkId)

      setWallet(wallet)

      const encryptedWallet = wallet.encrypt(password)
      Storage.save(username, encryptedWallet)

      onButtonNext()
    } catch (e) {
      if (isHTTPError(e)) {
        setSnackbarMessage({ text: e.error.detail, type: 'alert' })
      }
    }
  }

  return (
    <MainPanel>
      <PanelContainer>
        <PanelTitle color="primary">Secret words</PanelTitle>
        <PanelContent>
          <SectionContent>
            <TextAreaTags
              tagifyRef={tagifyRef}
              placeholder={phrase.length.toString()}
              whitelist={allowedWords.current}
              onChange={handlePhraseChange}
            />
          </SectionContent>
          <CenteredSecondaryParagraph>
            {!isNextButtonActive()
              ? 'Make sure to properly write down the 24 secret words. They are the key to your wallet.'
              : "All good? Let's continue!"}
          </CenteredSecondaryParagraph>
        </PanelContent>
        {isNextButtonActive() && (
          <FooterActions>
            <Button secondary onClick={onButtonBack}>
              Cancel
            </Button>
            <Button onClick={handleWalletImport}>Continue</Button>
          </FooterActions>
        )}
      </PanelContainer>
    </MainPanel>
  )
}

export default ImportWordsPage
