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

import { getHumanReadableError, walletImport } from '@alephium/sdk'
import Tagify, { BaseTagData, ChangeEventData, TagData } from '@yaireo/tagify'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import TextAreaTags from '@/components/Inputs/TextAreaTags'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import Paragraph from '@/components/Paragraph'
import { Address, useAddressesContext } from '@/contexts/addresses'
import { useGlobalContext } from '@/contexts/global'
import { useStepsContext } from '@/contexts/steps'
import { useWalletContext } from '@/contexts/wallet'
import { useAppDispatch } from '@/hooks/redux'
import useAddressDiscovery from '@/hooks/useAddressDiscovery'
import AddressMetadataStorage from '@/persistent-storage/address-metadata'
import WalletStorage from '@/persistent-storage/wallet'
import { walletSaved } from '@/store/activeWalletSlice'
import { syncAddressesData } from '@/store/addressesSlice'
import { initialAddressSettings } from '@/utils/addresses'
import { bip39Words } from '@/utils/bip39'

const ImportWordsPage = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { setSnackbarMessage } = useGlobalContext()
  const { password, walletName } = useWalletContext()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { saveNewAddress } = useAddressesContext()
  const discoverAndSaveActiveAddresses = useAddressDiscovery(false)

  const [phrase, setPhrase] = useState<{ value: string }[]>([])
  const allowedWords = useRef(bip39Words.split(' '))
  const defaultPlaceholder = t('Type your recovery phrase')
  const [customPlaceholder, setCustomPlaceholder] = useState(defaultPlaceholder)
  const tagifyRef = useRef<Tagify<TagData> | undefined>()

  const handlePhraseChange = (event: CustomEvent<ChangeEventData<BaseTagData>>) => {
    // Split words where spaces are
    const newPhrase = event.detail.value && JSON.parse(event.detail.value)
    setPhrase(newPhrase || [])
    setCustomPlaceholder(
      newPhrase.length > 0 ? t('{{ amount }} words entered', { amount: newPhrase.length }) : defaultPlaceholder
    )
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

      WalletStorage.store(walletName, password, wallet)
      AddressMetadataStorage.store({
        index: 0,
        settings: initialAddressSettings,
        dataKey: {
          mnemonic: wallet.mnemonic,
          walletName: walletName
        }
      })
      dispatch(
        walletSaved({
          name: walletName,
          mnemonic: wallet.mnemonic,
          initialAddress: {
            index: 0,
            hash: wallet.address,
            publicKey: wallet.publicKey,
            privateKey: wallet.privateKey,
            ...initialAddressSettings
          }
        })
      )
      dispatch(syncAddressesData())

      saveNewAddress(
        new Address(wallet.address, wallet.publicKey, wallet.privateKey, 0, { isMain: true }),
        wallet.mnemonic,
        walletName
      )
      discoverAndSaveActiveAddresses(wallet.mnemonic, [0])
      onButtonNext()
    } catch (e) {
      setSnackbarMessage({ text: getHumanReadableError(e, t`Error while importing wallet`), type: 'alert' })
    }
  }

  // Alephium's node code uses 12 as the minimal mnemomic length.
  const isNextButtonActive = phrase.length >= 12

  return (
    <FloatingPanel>
      <PanelTitle color="primary">{t`Secret recovery phrase`}</PanelTitle>
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
            ? t`Make sure to store the words in a secure location! They are your wallet's secret recovery phrase.`
            : t`All good? Let's continue!`}
        </Paragraph>
      </PanelContentContainer>
      <FooterActionsContainer>
        <Button role="secondary" onClick={onButtonBack}>
          {t`Cancel`}
        </Button>
        <Button onClick={handleWalletImport} disabled={!isNextButtonActive}>
          {t`Continue`}
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default ImportWordsPage
