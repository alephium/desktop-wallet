import { PageContainer, SectionContent } from '../../components/PageComponents'
import QRCode from 'qrcode.react'
import { useContext } from 'react'
import { GlobalContext } from '../../App'
import Paragraph from '../../components/Paragraph'
import { openInNewWindow, truncate } from '../../utils/misc'
import { loadSettingsOrDefault } from '../../utils/clients'
import { Button } from '../../components/Buttons'

const AddressPage = () => {
  const { wallet, setSnackbarMessage } = useContext(GlobalContext)

  const address = wallet?.address

  const handleShowInExplorer = () => {
    const { explorerUrl } = loadSettingsOrDefault()
    if (explorerUrl) {
      openInNewWindow(`${explorerUrl}/#/addresses/${address}`)
    }
  }

  const handleCopy = () => {
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

  return (
    <PageContainer>
      <SectionContent>{address && <QRCode value={address} />}</SectionContent>
      <SectionContent>
        <Paragraph>{truncate(address || '')}</Paragraph>
      </SectionContent>

      <SectionContent>
        <Button secondary onClick={handleShowInExplorer}>
          Show in explorer
        </Button>
        <Button secondary onClick={handleCopy}>
          Copy address
        </Button>
      </SectionContent>
    </PageContainer>
  )
}

export default AddressPage
