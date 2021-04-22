import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { CreateWalletContext } from '.'
import { Button } from '../../components/Buttons'
import { FooterActions, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import tinycolor from 'tinycolor2'
import Paragraph from '../../components/Paragraph'
import { motion } from 'framer-motion'

const CheckWords = () => {
  const { mnemonic, onButtonBack, onButtonNext } = useContext(CreateWalletContext)
  const wordList = mnemonic.split(' ')

  const [selectedWords, setSelectedWords] = useState<string[]>([])

  const renderRemainingWords = () => {
    return wordList
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

  return (
    <PageContainer>
      <PageTitle color="primary">Security Check</PageTitle>
      <SectionContent>
        <Paragraph style={{ width: '100%' }}>Select the words in the right order.</Paragraph>
        <SelectedWordList>{renderSelectedWords()}</SelectedWordList>
        <RemainingWordList>{renderRemainingWords()}</RemainingWordList>
      </SectionContent>
      {selectedWords && selectedWords.length === wordList.length && (
        <FooterActions apparitionDelay={0.3}>
          <Button secondary onClick={onButtonBack}>
            Cancel
          </Button>
          <Button onClick={onButtonNext}>Continue</Button>
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
