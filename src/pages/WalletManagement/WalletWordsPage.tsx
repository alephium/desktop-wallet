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

import { useContext } from 'react'
import styled from 'styled-components'
import { WalletManagementContext } from './WalletManagementContext'
import { InfoBox } from '../../components/InfoBox'
import {
  FooterActions,
  MainPanel,
  PanelContainer,
  PanelContent,
  PanelTitle,
  SectionContent
} from '../../components/PageComponents'
import { Edit3 } from 'lucide-react'
import { Button } from '../../components/Buttons'
import { GlobalContext } from '../../App'
import { StepsContext } from '../MultiStepsController'
import tinycolor from 'tinycolor2'

const WalletWordsPage = () => {
  const { mnemonic, plainWallet } = useContext(WalletManagementContext)
  const { onButtonBack, onButtonNext } = useContext(StepsContext)
  const { setSnackbarMessage } = useContext(GlobalContext)

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
    <MainPanel enforceMinHeight>
      <PanelContainer>
        <PanelTitle color="primary" onBackButtonPress={onButtonBack}>
          Your Wallet
        </PanelTitle>
        <PanelContent>
          <PublicAddressContent>
            <InfoBox text={plainWallet?.address || ''} label={'Your address'} onClick={handleAddressClick} wordBreak />
          </PublicAddressContent>
          <WordsContent inList>
            <Label>Secret phrase</Label>
            <PhraseBox>{renderFormatedMnemonic(mnemonic)}</PhraseBox>
            <InfoBox
              text={'Carefully note the 24 words. They are the keys to your wallet.'}
              Icon={Edit3}
              importance="alert"
            />
          </WordsContent>
        </PanelContent>
        <FooterActions apparitionDelay={0.3}>
          <Button onClick={onButtonNext} submit>
            {"I've copied the words, continue"}
          </Button>
        </FooterActions>
      </PanelContainer>
    </MainPanel>
  )
}

const Label = styled.label`
  width: 100%;
  padding-left: 15px;
  padding-bottom: 5px;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 500;
`

const PublicAddressContent = styled(SectionContent)`
  flex: 0;
  justify-content: flex-start;
`

const WordsContent = styled(SectionContent)`
  justify-content: flex-start;
`

const PhraseBox = styled.div`
  display: flex;
  width: 100%;
  padding: 20px;
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: 500;
  background-color: ${({ theme }) => tinycolor(theme.global.alert).setAlpha(0.4).toString()};
  border: 1px solid ${({ theme }) => theme.global.alert};
  border-radius: 7px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`

const MnemonicWordContainer = styled.div`
  margin: 6px;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 5px 5px rgba(0, 0, 0, 0.1);
`

const MnemonicNumber = styled.div`
  display: inline-block;
  padding: 5px;
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
  padding: 5px 8px;
  font-weight: 600;
`

export default WalletWordsPage
