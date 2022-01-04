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

import { Edit3 } from 'lucide-react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import { Button } from '../../components/Buttons'
import InfoBox from '../../components/InfoBox'
import {
  FloatingPanel,
  FooterActionsContainer,
  PanelContentContainer,
  Section
} from '../../components/PageComponents/PageContainers'
import PanelTitle from '../../components/PageComponents/PanelTitle'
import { useGlobalContext } from '../../contexts/global'
import { useStepsContext } from '../../contexts/steps'
import { useWalletContext } from '../../contexts/wallet'

const WalletWordsPage = () => {
  const { mnemonic, plainWallet } = useWalletContext()
  const { onButtonBack, onButtonNext } = useStepsContext()
  const { setSnackbarMessage } = useGlobalContext()

  const handleAddressClick = () => {
    const address = plainWallet?.address
    if (address) {
      navigator.clipboard
        .writeText(address)
        .catch((e) => {
          throw e
        })
        .then(() => {
          setSnackbarMessage({ text: 'Address copied to clipboard!', type: 'info' })
        })
    }
  }

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
        <PublicAddressContent>
          <InfoBox text={plainWallet?.address || ''} label={'Your address'} onClick={handleAddressClick} wordBreak />
        </PublicAddressContent>
        <WordsContent inList>
          <Label>Secret phrase</Label>
          <PhraseBox>{renderFormatedMnemonic(mnemonic)}</PhraseBox>
          <InfoBox
            text={'Carefully note down the 24 words. They are the keys to your wallet.'}
            Icon={Edit3}
            importance="alert"
          />
        </WordsContent>
      </PanelContentContainer>
      <FooterActionsContainer apparitionDelay={0.3}>
        <Button onClick={onButtonNext} submit>
          {"I've copied the words, continue"}
        </Button>
      </FooterActionsContainer>
    </FloatingPanel>
  )
}

const Label = styled.label`
  width: 100%;
  padding-left: var(--spacing-3);
  padding-bottom: var(--spacing-1);
  color: ${({ theme }) => theme.font.secondary};
  font-weight: var(--fontWeight-medium);
`

const PublicAddressContent = styled(Section)`
  flex: 0;
  justify-content: flex-start;
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
  box-shadow: 0 5px 5px var(--color-shadow-10);
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

export default WalletWordsPage
