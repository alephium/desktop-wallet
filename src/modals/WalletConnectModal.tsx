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

import { BinaryIcon, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AssetLogo from '@/components/AssetLogo'
import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'
import { Section } from '@/components/PageComponents/PageContainers'
import Table, { TableRow } from '@/components/Table'
import { useWalletConnectContext } from '@/contexts/walletconnect'
import CenteredModal, { CenteredModalProps } from '@/modals/CenteredModal'
import { cleanUrl } from '@/utils/misc'

const WalletConnectModal = (props: CenteredModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const { pairWithDapp, unpairFromDapp, activeSessions } = useWalletConnectContext()

  const [uri, setUri] = useState('')

  const handleConnect = () => {
    pairWithDapp(uri)
    setUri('')
  }

  return (
    <CenteredModal
      title="WalletConnect"
      subtitle={t(activeSessions.length > 0 ? 'Active dApp connections' : 'Connect to a dApp')}
      {...props}
    >
      {activeSessions.length > 0 && (
        <Section>
          <Table>
            {activeSessions.map(({ topic, peer: { metadata } }) => (
              <TableRow key={topic} role="row" tabIndex={0}>
                <Row>
                  <div style={{ width: 35 }}>
                    {metadata.icons[0] ? (
                      <AssetLogo assetId={metadata.url} assetImageUrl={metadata.icons[0]} size={35} />
                    ) : (
                      <BinaryIcon size={35} color={theme.font.secondary} />
                    )}
                  </div>
                  {cleanUrl(metadata.url)}
                  <Button
                    onClick={() => unpairFromDapp(topic)}
                    Icon={Trash2}
                    squared
                    role="secondary"
                    style={{ marginLeft: 'auto' }}
                  />
                </Row>
              </TableRow>
            ))}
          </Table>
        </Section>
      )}
      <Section>
        <Row>
          <Input
            onChange={(t) => setUri(t.target.value)}
            value={uri}
            label={t('Paste WalletConnect URI copied from the dApp')}
            heightSize="big"
          />
          <ConnectButton onClick={handleConnect} disabled={uri === ''}>
            {t('Connect')}
          </ConnectButton>
        </Row>
      </Section>
    </CenteredModal>
  )
}

export default WalletConnectModal

const Row = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 15px;
  width: 100%;
`

const ConnectButton = styled(Button)`
  width: auto;
  padding: 0 26px;
`
