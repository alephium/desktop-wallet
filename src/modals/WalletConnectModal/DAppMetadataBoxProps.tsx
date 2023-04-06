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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import { useWalletConnectContext, WalletConnectContextProps } from '@/contexts/walletconnect'

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
      <Row>
        <Label>{t('Name')}</Label>
        <span>{metadata.name}</span>
      </Row>
      <HorizontalDivider />
      <Row>
        <Label>{t('Description')}</Label>
        <span>{metadata.description}</span>
      </Row>
      <HorizontalDivider />
      <Row>
        <Label>URL</Label>
        <span>{metadata.url}</span>
      </Row>
      <HorizontalDivider />
      <Row>
        <Label>{t('Network')}</Label>
        <span>{requiredChainInfo?.networkId}</span>
      </Row>
      <HorizontalDivider />
      <Row>
        <Label>{t('Address group')}</Label>
        <span>{requiredChainInfo?.chainGroup?.toString() ?? t('all')}</span>
      </Row>
    </Box>
  )
}

export default DAppMetadataBox

// TODO: DRY together with Send modal ("info-check" screen)
const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 18px 15px;
`

const Label = styled.div`
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`
