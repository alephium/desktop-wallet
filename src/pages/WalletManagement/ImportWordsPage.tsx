import { useRef, useState } from 'react'
import { TextAreaTags } from '../../components/Inputs'
import { PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import { bip39Words } from '../../utils/bip39'

const ImportWordsPage = () => {
  const [phrase, setPhrase] = useState('')
  const allowedWords = useRef(bip39Words.split(' '))

  const handlePhraseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // Split words where spaces are

    setPhrase(e.target.value)
  }

  return (
    <PageContainer>
      <PageTitle color="primary">Secret words</PageTitle>
      <SectionContent>
        <TextAreaTags placeholder="Type your 24 words" whitelist={allowedWords.current} />
      </SectionContent>
    </PageContainer>
  )
}

export default ImportWordsPage
