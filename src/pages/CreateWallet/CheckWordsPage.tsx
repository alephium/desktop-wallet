import React, { useContext, useRef, useState } from 'react'
import styled from 'styled-components'
import { CreateWalletContext } from './CreateWalletRootPage'
import { Button } from '../../components/Buttons'
import { FooterActions, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import tinycolor from 'tinycolor2'
import Paragraph from '../../components/Paragraph'
import { motion, PanInfo } from 'framer-motion'
import { throttle } from 'lodash'
import { Storage } from 'alf-client'
import { GlobalContext } from '../../App'
import { useHistory } from 'react-router'

const getShuffledArr = (arr: string[]) => {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]]
  }
  return newArr
}

const CheckWordsPage = () => {
  const history = useHistory()
  const { mnemonic, plainWallet, password, username, onButtonBack } = useContext(CreateWalletContext)
  const { setWallet } = useContext(GlobalContext)
  const splitMnemonic = mnemonic.split(' ')

  const wordList = useRef(getShuffledArr(splitMnemonic))

  const [selectedWords, setSelectedWords] = useState<string[]>([])
  const selectedElements = useRef<{ [word: string]: Element | null }>(
    splitMnemonic.reduce((p, c) => ({ ...p, [c]: null }), {})
  )

  // === Drag interaction ===
  const [isDragging, setIsDragging] = useState(false)
  const [closestWord, setClosestWord] = useState('')

  // === Actions ===
  // ===============
  const handleSelectedWordRemove = (w: string) => {
    if (isDragging) {
      setIsDragging(false)
      return
    }
    setSelectedWords(selectedWords.filter((word) => w !== word))

    // Remove from element list
    selectedElements.current[w] = null
  }

  const handleSelectedWordDrag = throttle(
    (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
      word: string,
      currentSelectedElements: typeof selectedElements.current
    ) => {
      //if (Math.abs(info.offset.x) < 5 || Math.abs(info.offset.y) < 2) return

      const { [word]: _currentElement, ...otherElements } = currentSelectedElements
      const closestElement = Object.values(otherElements).reduce(
        (p, c, i) => {
          // Distance
          let returnedObject

          if (c) {
            const rect = c.getBoundingClientRect()
            const distance = Math.hypot(rect.x - info.point.x, rect.y - info.point.y)

            if (p.distance === 0) {
              returnedObject = {
                word: Object.keys(otherElements)[i],
                element: c,
                distance: distance
              }
            } else if (distance < p.distance) {
              returnedObject = {
                word: Object.keys(otherElements)[i],
                element: c,
                distance: distance
              }
            } else {
              returnedObject = p
            }
          } else {
            returnedObject = p
          }

          return returnedObject
        },
        {
          word: '',
          element: null as Element | null,
          distance: 0
        }
      )

      setClosestWord(closestElement.word)
    },
    300
  )

  const handleSelectedWordDragEnd = (word: string, newNeighbourWord: string) => {
    // Find neighbour index
    if (closestWord) {
      const currentIndex = selectedWords.findIndex((w) => w === word)
      let newIndex = selectedWords.findIndex((w) => w === newNeighbourWord)
      if (currentIndex < newIndex) {
        newIndex -= 1
      }

      const filteredWords = selectedWords.filter((w) => w !== word)
      setSelectedWords([...filteredWords.slice(0, newIndex), word, ...filteredWords.slice(newIndex)])
      setClosestWord('')
    }
  }

  // === Renders

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
      <SelectedWord
        onPointerUp={() => handleSelectedWordRemove(w)}
        key={w}
        layoutId={w}
        drag
        ref={(element) => {
          if (selectedElements.current && element) selectedElements.current[w] = element
        }}
        onDragStart={() => setIsDragging(true)}
        onDrag={(e, info) => handleSelectedWordDrag(e, info, w, selectedElements.current)}
        onDragEnd={() => handleSelectedWordDragEnd(w, closestWord)}
      >
        {isDragging && closestWord === w && <DragCursor layoutId="cursor" />}
        {w}
      </SelectedWord>
    ))
  }

  const areWordsValid = () => {
    return selectedWords.toString() == splitMnemonic.toString()
  }

  const createEncryptedWallet = async () => {
    if (areWordsValid() && plainWallet) {
      const walletEncrypted = await plainWallet.encrypt(password)
      Storage().save(username, walletEncrypted)
      setWallet(plainWallet)
      return true
    }
  }

  const handleButtonNext = () => {
    const success = createEncryptedWallet()
    if (success) history.push('/wallet')
    else {
      console.error('Something went wrong when creating encrypted wallet!')
    }
  }

  return (
    <PageContainer>
      <PageTitle color="primary" onBackButtonPress={onButtonBack}>
        Security Check
      </PageTitle>
      <SectionContent>
        <Paragraph style={{ width: '100%' }}>Select the words in the right order.</Paragraph>
        <SelectedWordList
          className={selectedWords.length === wordList.current.length ? (areWordsValid() ? 'valid' : 'error') : ''}
        >
          {renderSelectedWords()}
        </SelectedWordList>
        <RemainingWordList>{renderRemainingWords()}</RemainingWordList>
      </SectionContent>
      {selectedWords.length === wordList.current.length && (
        <FooterActions>
          <Button secondary onClick={onButtonBack}>
            Cancel
          </Button>
          <Button onClick={handleButtonNext} disabled={!areWordsValid()}>
            Continue
          </Button>
        </FooterActions>
      )}
    </PageContainer>
  )
}

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
  position: relative;
  cursor: pointer;

  &:not(:last-child) {
    margin-right: 10px;
  }

  &:hover {
    background-color: ${({ theme }) => tinycolor(theme.global.accent).setAlpha(0.8).toString()};
  }
`

const DragCursor = styled(motion.div)`
  position: absolute;
  left: -7px;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: ${({ theme }) => theme.global.accent};
  z-index: 100;
`

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

  &.valid {
    ${SelectedWord} {
      background-color: ${({ theme }) => theme.global.valid};
    }
  }

  &.error {
    ${SelectedWord} {
      background-color: ${({ theme }) => theme.global.alert};
    }
  }
`

const RemainingWord = styled(SelectedWord)`
  background-color: ${({ theme }) => theme.global.accent};
  background-color: ${({ theme }) => tinycolor(theme.global.accent).setAlpha(0.2).toString()};
  color: ${({ theme }) => theme.global.accent};

  &:hover {
    background-color: ${({ theme }) => tinycolor(theme.global.accent).setAlpha(0.3).toString()};
  }
`

export default CheckWordsPage
