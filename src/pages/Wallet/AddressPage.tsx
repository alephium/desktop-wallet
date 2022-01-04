/*
Copyright 2018 - 2021 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import { Button } from '../../components/Buttons'
import { Section } from '../../components/PageComponents/PageContainers'
import Paragraph from '../../components/Paragraph'
import { useGlobalContext } from '../../contexts/global'
import { openInWebBrowser } from '../../utils/misc'
import { loadStoredSettings } from '../../utils/settings'

const AddressPage = () => {
  const { wallet, setSnackbarMessage } = useGlobalContext()
  const theme = useTheme()

  const address = wallet?.address

  const handleShowInExplorer = () => {
    const {
      network: { explorerUrl }
    } = loadStoredSettings()

    if (explorerUrl) {
      const cleanURL = `${explorerUrl}/#/addresses/${address}`.replace(/([^:]\/)\/+/g, '$1') // Remove forward slashes duplicates if needed
      openInWebBrowser(cleanURL)
    }
  }

  const handleCopy = () => {
    if (address) {
      navigator.clipboard
        .writeText(address)
        .catch((error) => {
          setSnackbarMessage({ text: 'Could not copy to clipboard, please copy manually', type: 'alert' })
          console.error('Error during copying address to clipboard:', error)
        })
        .then(() => {
          setSnackbarMessage({ text: 'Address copied to clipboard!', type: 'info' })
        })
    }
  }

  return (
    <>
      <Section>
        {address && (
          <QRCode
            value={address}
            style={{ marginTop: 25 }}
            fgColor={theme.font.primary}
            bgColor={theme.bg.primary}
            size={128}
          />
        )}
      </Section>
      <ShortenParagraph>{address}</ShortenParagraph>
      <Section inList>
        <Button secondary onClick={handleShowInExplorer}>
          Show in explorer
        </Button>
        <Button secondary onClick={handleCopy}>
          Copy address
        </Button>
      </Section>
    </>
  )
}

const ShortenParagraph = styled(Paragraph)`
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  margin-top: 50px;
`

export default AddressPage
