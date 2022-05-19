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

import { getWalletFromMnemonic } from '@alephium/sdk'
import { generateMnemonic } from 'bip39'
import { AlertTriangle, Edit3 } from 'lucide-react'
import { ChangeEvent, useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import ActionLink from '../../components/ActionLink'
import Button from '../../components/Button'
import InfoBox from '../../components/InfoBox'
import WalletPassphrase from '../../components/Inputs/WalletPassphrase'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '../../components/PageComponents/PageContainers'
import PanelTitle from '../../components/PageComponents/PanelTitle'
import { useStepsContext } from '../../contexts/steps'
import { useWalletContext } from '../../contexts/wallet'
import { openInWebBrowser } from '../../utils/misc'

const WalletWordsPage = () => {
  const { mnemonic, setPlainWallet, setMnemonic } = useWalletContext()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const [passphrase, setPassphraseState] = useState('')

  useEffect(() => {
    setMnemonic(generateMnemonic(256))
  }, [setMnemonic])

  const onGenerate = useCallback(() => {
    let mnemonicFinal = mnemonic
    if (passphrase) {
      mnemonicFinal += ' ' + passphrase
    }
    const wallet = getWalletFromMnemonic(mnemonicFinal)
    setPlainWallet(wallet)
    onButtonNext()
  }, [setPlainWallet, onButtonNext, passphrase, mnemonic])

  const onUpdatePassphrase = useCallback(
    (e: ChangeEvent<HTMLInputElement>): void => {
      setPassphraseState(e.target.value)
    },
    [setPassphraseState]
  )

  const renderFormatedMnemonic = (mnemonic: string) => {
    return mnemonic.split(' ').map((w, i) => {
      return (
        <MnemonicWordContainer key={i}>
          <MnemonicNumber>{i + 1}</MnemonicNumber>
          <MnemonicWord>{w}</MnemonicWord>
        </MnemonicWordContainer>
      )
    })
  }

  return (
    <FloatingPanel enforceMinHeight>
      <PanelTitle color="primary" onBackButtonClick={onButtonBack}>
        Your Wallet
      </PanelTitle>
      <PanelContentContainer>
        <WordsContent inList>
          <Label>Secret phrase</Label>
          <PhraseBox>{renderFormatedMnemonic(mnemonic)}</PhraseBox>
          <InfoBox
            text={'Carefully note down the words! They are the secret keys to your wallet.'}
            Icon={Edit3}
            importance="alert"
          />
          <InfoBox Icon={AlertTriangle} importance="accent" label="Advanced feature">
            <div>
              At this point a wallet passphrase can be set which plausibly denies the funds belong to you. A more
              detailed explanation about how this protection works can be
              <ActionLink
                onClick={() =>
                  openInWebBrowser(
                    'https://blog.trezor.io/passphrase-the-ultimate-protection-for-your-accounts-3a311990925b'
                  )
                }
              >
                &nbsp;found here
              </ActionLink>
              . This is also known as the &quot;25th word&quot;.
            </div>
            <WalletPassphrase
              value={passphrase}
              label="Enter passphrase"
              onChange={onUpdatePassphrase}
              isValid={passphrase.length > 0}
            />
          </InfoBox>
        </WordsContent>
      </PanelContentContainer>
      <FooterActionsContainer apparitionDelay={0.3}>
        <Button onClick={onGenerate} submit>
          {"I've copied the words, continue"}
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

export default WalletWordsPage

const Label = styled.label`
  width: 100%;
  padding-left: var(--spacing-3);
  padding-bottom: var(--spacing-1);
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--fontWeight-medium);
`

const WordsContent = styled(Section)`
  justify-content: flex-start;
`

const PhraseBox = styled.div`
  display: flex;
  width: 100%;
  padding: var(--spacing-4);
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: var(--fontWeight-medium);
  background-color: ${({ theme }) => tinycolor(theme.global.alert).setAlpha(0.4).toString()};
  border: 1px solid ${({ theme }) => theme.global.alert};
  border-radius: var(--radius);
  margin-bottom: var(--spacing-4);
  flex-wrap: wrap;
`

const MnemonicWordContainer = styled.div`
  margin: 6px;
  border-radius: var(--radius-small);
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadow.primary};
`

const MnemonicNumber = styled.div`
  display: inline-block;
  padding: var(--spacing-1);
  border-right: 1px ${({ theme }) => theme.bg.secondary};
  background-color: ${({ theme }) =>
    theme.name === 'light'
      ? tinycolor(theme.bg.primary).setAlpha(0.4).toString()
      : tinycolor(theme.bg.contrast).setAlpha(0.4).toString()};
  color: ${({ theme }) => theme.font.primary};
`

const MnemonicWord = styled.div`
  display: inline-block;
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.primary : theme.bg.contrast)};
  color: ${({ theme }) => (theme.name === 'light' ? theme.font.primary : theme.font.contrastSecondary)};
  padding: var(--spacing-1) 8px;
  font-weight: var(--fontWeight-semiBold);
`
