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

import { BellPlus } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import InfoBox from '../components/InfoBox'
import { Section } from '../components/PageComponents/PageContainers'
import { openInWebBrowser } from '../utils/misc'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'

interface UpdateWalletModalProps {
  onClose: () => void
  newVersion: string
}

const UpdateWalletModal = ({ onClose, newVersion }: UpdateWalletModalProps) => {
  const { t } = useTranslation('App')

  return (
    <CenteredModal title={t`New version`} onClose={onClose} focusMode>
      <Section>
        <InfoBox Icon={BellPlus}>
          {t(
            'Version {{ newVersion }} is available. Please, download it and install it to avoid any issues with wallet.',
            { newVersion }
          )}
        </InfoBox>
      </Section>
      <ModalFooterButtons>
        <ModalFooterButton
          onClick={() => openInWebBrowser('https://github.com/alephium/desktop-wallet/releases/latest')}
        >
          {t`Download`}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default UpdateWalletModal
