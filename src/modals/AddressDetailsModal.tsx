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

import { FileDown } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import Badge from '@/components/Badge'
import Box from '@/components/Box'
import Button from '@/components/Button'
import ShortcutButtons from '@/components/Buttons/ShortcutButtons'
import HashEllipsed from '@/components/HashEllipsed'
import QRCode from '@/components/QRCode'
import TransactionList from '@/components/TransactionList'
import { useAppSelector } from '@/hooks/redux'
import CSVExportModal from '@/modals/CSVExportModal'
import ModalPortal from '@/modals/ModalPortal'
import SideModal from '@/modals/SideModal'
import AmountsOverviewPanel from '@/pages/UnlockedWallet/OverviewPage/AmountsOverviewPanel'
import AssetsList from '@/pages/UnlockedWallet/OverviewPage/AssetsList'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'
import { openInWebBrowser } from '@/utils/misc'

interface AddressDetailsModalProps {
  addressHash: AddressHash
  onClose: () => void
}

const AddressDetailsModal = ({ addressHash, onClose }: AddressDetailsModalProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))
  const explorerUrl = useAppSelector((s) => s.network.settings.explorerUrl)

  const [isCSVExportModalOpen, setIsCSVExportModalOpen] = useState(false)
  const [showChart, setShowChart] = useState(false)

  if (!address) return null

  return (
    <SideModal
      onClose={onClose}
      title={t('Address details')}
      width={700}
      onAnimationComplete={() => setShowChart(true)}
      header={
        <Header>
          <LeftSide>
            <AddressColorIndicator addressHash={address.hash} size={30} />
            <Title>
              <AddressBadgeStyled addressHash={address.hash} hideColorIndication disableCopy truncate />
              {address.label && <TitleAddressHash hash={address.hash} />}
            </Title>
            <Badge short color={theme.font.tertiary} border>
              {t('Group')} {address.group}
            </Badge>
          </LeftSide>
          <ExplorerButton
            role="secondary"
            transparent
            short
            onClick={() => openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)}
          >
            {t('Show in explorer')} ↗
          </ExplorerButton>
        </Header>
      }
    >
      <StyledAmountsOverviewPanel addressHash={addressHash} showChart={showChart}>
        <QRCode value={addressHash} size={130} />
      </StyledAmountsOverviewPanel>

      <Content>
        <Shortcuts>
          <ButtonsGrid>
            <ShortcutButtons
              receive
              send
              addressSettings
              addressHash={address.hash}
              analyticsOrigin="address_details"
              solidBackground
            />
          </ButtonsGrid>
        </Shortcuts>
        <AssetsList
          addressHashes={[address.hash]}
          tokensTabTitle={`💰 ${t('Address tokens')}`}
          nftsTabTitle={`🖼️ ${t('Address NFTs')}`}
        />
        <TransactionList
          title={t('Address transactions')}
          addressHashes={[address.hash]}
          compact
          hideFromColumn
          headerExtraContent={
            <Button short role="secondary" Icon={FileDown} onClick={() => setIsCSVExportModalOpen(true)}>
              {t('Export')}
            </Button>
          }
        />
      </Content>
      <ModalPortal>
        {isCSVExportModalOpen && (
          <CSVExportModal addressHash={addressHash} onClose={() => setIsCSVExportModalOpen(false)} />
        )}
      </ModalPortal>
    </SideModal>
  )
}

export default AddressDetailsModal

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`

const ExplorerButton = styled(Button)`
  width: auto;
  margin-right: 30px;
`

const StyledAmountsOverviewPanel = styled(AmountsOverviewPanel)`
  padding: 0;
`

const AddressBadgeStyled = styled(AddressBadge)`
  font-size: 23px;
  font-weight: var(--fontWeight-semiBold);
  max-width: 150px;
`

const Title = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  max-width: 300px;
`

const TitleAddressHash = styled(HashEllipsed)`
  max-width: 100px;
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
`

const Content = styled.div`
  padding: 0 var(--spacing-4) var(--spacing-4);
  position: relative;
`

const Shortcuts = styled(Box)`
  overflow: hidden;
  background-color: ${({ theme }) => theme.bg.primary};
  margin-bottom: 40px;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`
