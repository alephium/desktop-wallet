import React, { useContext, useRef, useState } from 'react'
import styled from 'styled-components'
import { CreateWalletContext } from '.'
import { Button } from '../../components/Buttons'
import { FooterActions, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import tinycolor from 'tinycolor2'
import Paragraph from '../../components/Paragraph'
import { motion } from 'framer-motion'

const getShuffledArr = (arr: string[]) => {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]]
  }
  return newArr
}

const CheckWords = () => {
  const { mnemonic, onButtonBack, onButtonNext } = useContext(CreateWalletContext)
  const splitMnemonic = mnemonic.split(' ')

  const wordList = useRef(getShuffledArr(splitMnemonic))

  const [selectedWords, setSelectedWords] = useState<string[]>([])

  const renderRemainingWords = () => {
    return wordList.current
      .filter((w) => !selectedWords?.includes(w))
      .map((w) => (
        <RemainingWord onClick={() => setSelectedWords([...selectedWords, w])} key={w} layoutId={w}>
          {w}
        </RemainingWord>
      ))
  }

  const renderSelectedWords = () => {
    return selectedWords?.map((w) => (
      <SelectedWord onClick={() => setSelectedWords(selectedWords.filter((word) => w !== word))} key={w} layoutId={w}>
        {w}
      </SelectedWord>
    ))
  }

  const areWordsValid = () => {
    console.log('YYO')
    return selectedWords.toString() == splitMnemonic.toString()
  }

  const createEncryptedWallet = async () => {
    /*
    if (this.isMnemonicValid()) {
      const walletEncrypted = await this.props.wallet.encrypt(this.props.credentials.password)
      storage.save(this.props.credentials.username, walletEncrypted)
      this.props.setWallet(this.props.wallet)
    }
    */
  }

  return (
    <PageContainer>
      <PageTitle color="primary" onBackButtonPress={onButtonBack}>
        Security Check
      </PageTitle>
      <SectionContent>
        <Paragraph style={{ width: '100%' }}>Select the words in the right order.</Paragraph>
        <SelectedWordList>{renderSelectedWords()}</SelectedWordList>
        <RemainingWordList>{renderRemainingWords()}</RemainingWordList>
      </SectionContent>
      {selectedWords.length === wordList.current.length && (
        <FooterActions apparitionDelay={0.3}>
          <Button secondary onClick={onButtonBack}>
            Cancel
          </Button>
          <Button onClick={onButtonNext} disabled={!areWordsValid()}>
            Continue
          </Button>
        </FooterActions>
      )}
    </PageContainer>
  )
}

const SelectedWordList = styled.div`
  width: 100%;
  padding: 20px;
  min-height: 30vh;
  border-radius: 14px;
  border: 3px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.secondary};
  margin-bottom: 20px;

  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: flex-start;
`

const RemainingWordList = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
  flex: 1;
  align-items: flex-start;
  justify-content: flex-start;
  align-content: flex-start;
`

const SelectedWord = styled(motion.div)`
  padding: 6px 10px;
  border-radius: 5px;
  background-color: ${({ theme }) => theme.global.accent};
  color: ${({ theme }) => theme.font.contrast};
  font-weight: 600;
  text-align: center;
  margin-bottom: 10px;

  &:not(:last-child) {
    margin-right: 10px;
  }
`

const RemainingWord = styled(SelectedWord)`
  background-color: ${({ theme }) => theme.global.accent};
  background-color: ${({ theme }) => tinycolor(theme.global.accent).setAlpha(0.2).toString()};
  color: ${({ theme }) => theme.global.accent};
`

export default CheckWords
