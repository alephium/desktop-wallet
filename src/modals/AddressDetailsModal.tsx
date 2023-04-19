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
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import AddressColorIndicator from '@/components/AddressColorIndicator'
import Box from '@/components/Box'
import Button from '@/components/Button'
import ShortcutButtons from '@/components/Buttons/ShortcutButtons'
import HashEllipsed from '@/components/HashEllipsed'
import HistoricWorthChart from '@/components/HistoricWorthChart'
import TransactionList from '@/components/TransactionList'
import { useAppSelector } from '@/hooks/redux'
import CSVExportModal from '@/modals/CSVExportModal'
import ModalPortal from '@/modals/ModalPortal'
import SideModal from '@/modals/SideModal'
import AmountsOverviewPanel from '@/pages/UnlockedWallet/OverviewPage/AmountsOverviewPanel'
import AssetsList from '@/pages/UnlockedWallet/OverviewPage/AssetsList'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { AddressHash } from '@/types/addresses'
import { ChartLength, DataPoint } from '@/types/chart'
import { currencies } from '@/utils/currencies'
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
  const [dataPoint, setDataPoint] = useState<DataPoint>()
  const [chartLength, setChartLength] = useState<ChartLength>('1y')

  if (!address) return null

  return (
    <SideModal
      onClose={onClose}
      title={t('Address details')}
      width={800}
      header={
        <Header>
          <LeftSide>
            <AddressColorIndicator addressHash={address.hash} />
            <Column>
              <AddressBadgeStyled addressHash={address.hash} hideColorIndication disableCopy truncate />
              <Subtitle>
                {address.label && <Hash hash={address.hash} />}
                <Group>
                  {t('Group')} {address.group}
                </Group>
              </Subtitle>
            </Column>
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
      <Content>
        <AmountsOverviewPanel
          addressHash={addressHash}
          worth={dataPoint?.y}
          date={dataPoint?.x}
          onChartLengthChange={setChartLength}
          chartLength={chartLength}
        >
          <QrCodeBox>
            <QRCode size={132} value={addressHash} bgColor={'transparent'} fgColor={theme.font.secondary} />
          </QrCodeBox>
        </AmountsOverviewPanel>

        <ChartContainer>
          <HistoricWorthChart
            addressHashes={[addressHash]}
            currency={currencies.USD.ticker}
            onDataPointHover={setDataPoint}
            length={chartLength}
          />
        </ChartContainer>

        <Shortcuts>
          <ButtonsGrid>
            <ShortcutButtons
              receive
              send
              addressSettings
              addressHash={address.hash}
              analyticsOrigin="address_details"
            />
          </ButtonsGrid>
        </Shortcuts>
        <AssetsList
          addressHashes={[address.hash]}
          tokensTabTitle={t('Address tokens')}
          nftsTabTitle={t('Address NFTs')}
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
  gap: 15px;
`

const ExplorerButton = styled(Button)`
  width: auto;
  margin-right: 30px;
`

const AddressBadgeStyled = styled(AddressBadge)`
  font-size: 23px;
  font-weight: var(--fontWeight-semiBold);
  max-width: 300px;
`

const Hash = styled(HashEllipsed)`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 16px;
  max-width: 250px;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const Group = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 16px;
  font-weight: var(--fontWeight-semiBold);
`

const Subtitle = styled.div`
  display: flex;
  gap: 20px;
`

const Content = styled.div`
  padding: 22px 28px;
  position: relative;
`

const Shortcuts = styled(Box)`
  overflow: hidden;
  background-color: ${({ theme }) => theme.border.primary};
  margin-bottom: 30px;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1px;
`

const QrCodeBox = styled(Box)`
  padding: 12px;
  width: auto;
  margin-left: auto;
  margin-right: 16px;
  background-color: ${({ theme }) => theme.bg.primary};
`

const ChartContainer = styled.div`
  position: absolute;
  right: 0;
  left: 0;
  top: 170px;
  height: 100px;
`
