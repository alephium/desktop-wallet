import { useTheme } from 'styled-components'

import Modal from '../../components/Modal'
import { AlertTriangle } from 'lucide-react'
import { Button } from '../../components/Buttons'
import { InfoBox } from '../../components/InfoBox'
import { SectionContent } from '../../components/PageComponents'
import { CenteredSecondaryParagraph } from '../../components/Paragraph'

const AccountRemovalModal = ({ onAccountRemove, onClose }: { onAccountRemove: () => void; onClose: () => void }) => {
  const theme = useTheme()

  return (
    <Modal title="Remove account" onClose={onClose} focusMode>
      <SectionContent>
        <AlertTriangle size={60} color={theme.global.alert} style={{ marginBottom: 35 }} />
      </SectionContent>
      <SectionContent>
        <InfoBox
          importance="alert"
          text="Please make sure to have your secret phrase saved and stored somewhere secure to restore your wallet in the future. Without the 24 words, your wallet will be unrecoverable and permanently lost."
        />

        <CenteredSecondaryParagraph>
          <b>Not your keys, not your coins.</b>
        </CenteredSecondaryParagraph>
      </SectionContent>
      <SectionContent inList>
        <Button alert onClick={onAccountRemove}>
          CONFIRM REMOVAL
        </Button>
      </SectionContent>
    </Modal>
  )
}

export default AccountRemovalModal
