/*
Copyright 2018 - 2022 The Alephium Authors
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

import { walletEncrypt } from '@alephium/sdk'
import { ScanLine } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import { useTheme } from 'styled-components'

import InfoBox from '../components/InfoBox'
import { Section } from '../components/PageComponents/PageContainers'
import PasswordConfirmation from '../components/PasswordConfirmation'
import { useGlobalContext } from '../contexts/global'
import CenteredModal from './CenteredModal'

const WalletQRCodeExportModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation('App')
  const { wallet } = useGlobalContext()
  const theme = useTheme()

  const [qrCodeTextToEncode, setQrCodeTextToEncode] = useState('')

  const mnemonic = wallet?.mnemonic

  if (!mnemonic) return null

  const handleCorrectPasswordEntered = (password: string) => {
    const encryptedDataToEncode = walletEncrypt(password, mnemonic)

    setQrCodeTextToEncode(encryptedDataToEncode)
  }

  return (
    <CenteredModal title={t`Export wallet`} onClose={onClose} focusMode narrow={!qrCodeTextToEncode}>
      {!qrCodeTextToEncode ? (
        <div>
          <PasswordConfirmation
            text={t`Type your password to export your wallet.`}
            buttonText={t`Show QR code`}
            onCorrectPasswordEntered={handleCorrectPasswordEntered}
          />
        </div>
      ) : (
        <Section>
          <InfoBox text={t`Scan this QR code with your mobile wallet.`} Icon={ScanLine} importance="accent" />
          <QRCode size={550} value={qrCodeTextToEncode} bgColor={theme.bg.primary} fgColor={theme.font.primary} />
        </Section>
      )}
    </CenteredModal>
  )
}

export default WalletQRCodeExportModal
