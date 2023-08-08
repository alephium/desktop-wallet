/*
Copyright 2018 - 2023 The Alephium Authors
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

import { encrypt } from '@alephium/sdk'
import { ScanLine } from 'lucide-react'
import { dataToFrames } from 'qrloop'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import PasswordConfirmation from '@/components/PasswordConfirmation'
import { useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import { selectAllAddresses, selectAllContacts } from '@/storage/addresses/addressesSelectors'

// Inspired by:
// - https://github.com/LedgerHQ/ledger-live/blob/edc7cc4091969564f8fe295ff2bf0a3e425a4ba6/apps/ledger-live-desktop/src/renderer/components/Exporter/QRCodeExporter.tsx
// - https://github.com/gre/qrloop/blob/06eaa7fd23bd27e0c638b1c66666cada1bbd0d30/examples/web-text-exporter

const FPS = 5

const WalletQRCodeExportModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const activeWalletMnemonic = useAppSelector((state) => state.activeWallet.mnemonic)
  const addresses = useAppSelector(selectAllAddresses)
  const contacts = useAppSelector(selectAllContacts)

  const [frames, setFrames] = useState<string[]>([])
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    let lastT: number
    let requestedAnimationFrame: number

    const loop = (t: number) => {
      requestedAnimationFrame = requestAnimationFrame(loop)

      if (!lastT) lastT = t

      if ((t - lastT) * FPS < 1000) return

      lastT = t

      setFrame((frame: number) => (frames.length > 0 ? (frame + 1) % frames.length : 0))
    }

    requestedAnimationFrame = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(requestedAnimationFrame)
    }
  }, [frames.length])

  if (!activeWalletMnemonic) return null

  const handleCorrectPasswordEntered = (password: string) => {
    const dataToEncrypt = {
      mnemonic: activeWalletMnemonic,
      addresses: addresses.map(({ index, label, color, isDefault }) => ({ index, label, color, isDefault })),
      contacts: contacts.map(({ name, address }) => ({ name, address }))
    }
    const encryptedData = encrypt(password, JSON.stringify(dataToEncrypt), 'sha512')

    setFrames(dataToFrames(encryptedData, 160, 4))
  }

  return (
    <CenteredModal title={t('Export wallet')} onClose={onClose} focusMode narrow={frames.length === 0} skipFocusOnMount>
      {frames.length === 0 ? (
        <div>
          <PasswordConfirmation
            text={t('Type your password to export your wallet.')}
            buttonText={t('Show QR code')}
            onCorrectPasswordEntered={handleCorrectPasswordEntered}
          />
        </div>
      ) : (
        <Section>
          <InfoBox
            text={t('Scan this animated QR code with your mobile wallet.')}
            Icon={ScanLine}
            importance="accent"
          />
          <QRCodeLoop>
            {frames.map((data, i) => (
              <div key={i} style={{ position: 'absolute', opacity: i === frame ? 1 : 0 }}>
                <QRCode size={460} value={data} bgColor={theme.bg.primary} fgColor={theme.font.primary} />
              </div>
            ))}
          </QRCodeLoop>
        </Section>
      )}
    </CenteredModal>
  )
}

export default WalletQRCodeExportModal

const QRCodeLoop = styled.div`
  position: relative;
  height: 460px;
  width: 100%;
  display: flex;
  justify-content: center;
`
