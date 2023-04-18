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

import { useTranslation } from 'react-i18next'

import Box from '@/components/Box'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import { useWalletConnectContext, WalletConnectContextProps } from '@/contexts/walletconnect'
import InfoRow from '@/modals/SendModals/InfoRow'

interface DAppMetadataBoxProps {
  metadata: WalletConnectContextProps['connectedDAppMetadata']
  className?: string
}

const DAppMetadataBox = ({ metadata, className }: DAppMetadataBoxProps) => {
  const { t } = useTranslation()
  const { requiredChainInfo } = useWalletConnectContext()

  if (!metadata) return null

  return (
    <Box className={className}>
      <InfoRow label={t('Name')}>{metadata.name}</InfoRow>
      <HorizontalDivider />
      <InfoRow label={t('Description')}>{metadata.description}</InfoRow>
      <HorizontalDivider />
      <InfoRow label="URL">{metadata.url}</InfoRow>
      <HorizontalDivider />
      <InfoRow label={t('Network')}>{requiredChainInfo?.networkId}</InfoRow>
      <HorizontalDivider />
      <InfoRow label={t('Address group')}>{requiredChainInfo?.chainGroup?.toString() ?? t('all')}</InfoRow>
    </Box>
  )
}

export default DAppMetadataBox
