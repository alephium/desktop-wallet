import React, { useContext, useRef, useState } from 'react'
import styled from 'styled-components'
import { WalletManagementContext } from './WalletManagementContext'
import { Button } from '../../components/Buttons'
import { FooterActions, PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import tinycolor from 'tinycolor2'
import Paragraph from '../../components/Paragraph'
import { motion, PanInfo } from 'framer-motion'
import { throttle } from 'lodash'
import { getStorage } from 'alf-client'
import { GlobalContext } from '../../App'
import { StepsContext } from '../MultiStepsController'

const Storage = getStorage()

const getShuffledArr = (arr: string[]) => {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]]
  }
  return newArr
}

interface WordKey {
  word: string
  key: string // Used to build layout and ensure anims are working when duplicates exist
}

const CheckWordsPage = () => {
  const { mnemonic, plainWallet, password, username } = useContext(WalletManagementContext)
  const { onButtonBack, onButtonNext } = useContext(StepsContext)

  const { setWallet } = useContext(GlobalContext)
  const splitMnemonic = mnemonic.split(' ')

  const wordList = useRef<WordKey[]>(
    getShuffledArr(splitMnemonic).map((wordString, i) => ({ word: wordString, key: `${wordString}-${i}` }))
  )

  const [selectedWords, setSelectedWords] = useState<WordKey[]>([])
  const selectedElements = useRef<{ [wordKey: string]: Element | null }>(
    splitMnemonic.reduce((p, c) => ({ ...p, [c]: null }), {})
  )

  // === Drag interaction ===
  const [isDragging, setIsDragging] = useState(false)
  const [closestWordKey, setClosestWordKey] = useState<string>('')

  // === Actions ===
  // ===============
  const handleSelectedWordRemove = (w: WordKey) => {
    if (isDragging) {
      setIsDragging(false)
      return
    }
    setSelectedWords(selectedWords.filter((word) => w.key !== word.key))

    // Remove from element list
    selectedElements.current[w.key] = null
  }

  const handleSelectedWordDrag = throttle(
    (
      event: MouseEvent | TouchEvent | PointerEvent,
      info: PanInfo,
      word: WordKey,
      currentSelectedElements: typeof selectedElements.current
    ) => {
      //if (Math.abs(info.offset.x) < 5 || Math.abs(info.offset.y) < 2) return

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [word.key]: _currentElement, ...otherElements } = currentSelectedElements
      const closestElement = Object.values(otherElements).reduce(
        (p, c, i) => {
          // Distance
          let returnedObject

          if (c) {
            const rect = c.getBoundingClientRect()
            const distance = Math.hypot(rect.x - info.point.x, rect.y - info.point.y)

            if (p.distance === 0) {
              returnedObject = {
                wordKey: Object.keys(otherElements)[i],
                element: c,
                distance: distance
              }
            } else if (distance < p.distance) {
              returnedObject = {
                wordKey: Object.keys(otherElements)[i],
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
          wordKey: '',
          element: null as Element | null,
          distance: 0
        }
      )

      setClosestWordKey(closestElement.wordKey)
    },
    300
  )

  const handleSelectedWordDragEnd = (word: WordKey, newNeighbourWordKey: string) => {
    // Find neighbour index
    if (closestWordKey) {
      const currentIndex = selectedWords.findIndex((w) => w.key === word.key)
      let newIndex = selectedWords.findIndex((w) => w.key === newNeighbourWordKey)
      if (currentIndex < newIndex) {
        newIndex -= 1
      }

      const filteredWords = selectedWords.filter((w) => w.key !== word.key)
      setSelectedWords([...filteredWords.slice(0, newIndex), word, ...filteredWords.slice(newIndex)])
      setClosestWordKey('')
    }
  }

  // === Renders

  const renderRemainingWords = () => {
    return wordList.current
      .filter((w) => !selectedWords?.includes(w))
      .map((w) => (
        <RemainingWord onClick={() => setSelectedWords([...selectedWords, w])} key={w.key} layoutId={w.key}>
          {w.word}
        </RemainingWord>
      ))
  }

  const renderSelectedWords = () => {
    return selectedWords?.map((w) => (
      <SelectedWord
        onPointerUp={() => handleSelectedWordRemove(w)}
        key={w.key}
        layoutId={w.key}
        drag
        ref={(element) => {
          if (selectedElements.current && element) selectedElements.current[w.key] = element
        }}
        onDragStart={() => setIsDragging(true)}
        onDrag={(e, info) => handleSelectedWordDrag(e, info, w, selectedElements.current)}
        onDragEnd={() => handleSelectedWordDragEnd(w, closestWordKey)}
      >
        {isDragging && closestWordKey === w.key && <DragCursor layoutId="cursor" />}
        {w.word}
      </SelectedWord>
    ))
  }

  const areWordsValid = () => {
    return selectedWords.map((w) => w.word).toString() == splitMnemonic.toString()
  }

  const createEncryptedWallet = async () => {
    if (areWordsValid() && plainWallet) {
      const walletEncrypted = await plainWallet.encrypt(password)
      Storage.save(username, walletEncrypted)
      setWallet(plainWallet)
      return true
    }
  }

  const handleButtonNext = async () => {
    const success = await createEncryptedWallet()
    if (success) onButtonNext()
    else {
      console.error('Something went wrong when creating encrypted wallet!')
    }
  }

  return (
    <PageContainer>
      <PageTitle color="primary" onBackButtonPress={onButtonBack} smaller>
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
