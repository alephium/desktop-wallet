import Tagify, { BaseTagData, ChangeEventData, TagData } from '@yaireo/tagify'
import { useEffect, useRef, useState } from 'react'
import { TextAreaTags } from '../../components/Inputs'
import { PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import { bip39Words } from '../../utils/bip39'

const ImportWordsPage = () => {
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

  useEffect(() => {
    if (tagifyRef.current) {
      tagifyRef.current.DOM.input.setAttribute('data-placeholder', customPlaceholder)
    }
  }, [customPlaceholder])

  return (
    <PageContainer>
      <PageTitle color="primary">Secret words</PageTitle>
      <SectionContent>
        <TextAreaTags
          tagifyRef={tagifyRef}
          placeholder={phrase.length.toString()}
          whitelist={allowedWords.current}
          onChange={handlePhraseChange}
        />
      </SectionContent>
      <SectionContent></SectionContent>
    </PageContainer>
  )
}

export default ImportWordsPage
