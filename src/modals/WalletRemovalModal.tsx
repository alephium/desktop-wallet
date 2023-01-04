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

import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'

import CenteredModal from './CenteredModal'

interface WalletRemovalModalProps {
  walletName: string
  onWalletRemove: () => void
  onClose: () => void
}

const WalletRemovalModal = ({ walletName, onWalletRemove, onClose }: WalletRemovalModalProps) => {
  const { t } = useTranslation('App')
  const theme = useTheme()

  return (
    <CenteredModal title={t('Remove wallet "{{ walletName }}"', { walletName })} onClose={onClose} focusMode>
      <Section>
        <AlertTriangle size={60} color={theme.global.alert} style={{ marginBottom: 35 }} />
      </Section>
      <Section>
        <InfoBox
          importance="alert"
          text={t`Please make sure to have your recovery phrase saved and stored somewhere secure to restore your wallet in the future. Without the recovery phrase, your wallet will be unrecoverable and permanently lost.`}
        />
        <Paragraph secondary centered>
          <b>{t`Not your keys, not your coins.`}</b>
        </Paragraph>
      </Section>
      <Section inList>
        <Button alert onClick={onWalletRemove}>
          {t`CONFIRM REMOVAL`}
        </Button>
      </Section>
    </CenteredModal>
  )
}

export default WalletRemovalModal
