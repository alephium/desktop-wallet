import { PageContainer, PageTitle, SectionContent } from '../../components/PageComponents'
import QRCode from 'qrcode.react'
import { useContext } from 'react'
import { GlobalContext } from '../../App'
import { useHistory } from 'react-router'
import Paragraph from '../../components/Paragraph'
import { openInNewWindow, truncate } from '../../utils/util'
import { loadSettingsOrDefault } from '../../utils/clients'
import { Button } from '../../components/Buttons'

const AddressPage = () => {
  const { wallet, setSnackbarMessage } = useContext(GlobalContext)

  const address = wallet?.address

  const history = useHistory()

  const onBackButtonPress = () => {
    history.push('/wallet')
  }

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
      <PageTitle onBackButtonPress={onBackButtonPress} smaller>
        Your address
      </PageTitle>
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
