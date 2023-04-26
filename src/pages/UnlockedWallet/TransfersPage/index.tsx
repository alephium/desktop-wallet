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

import { colord } from 'colord'
import { motion } from 'framer-motion'
import { map } from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ShortcutButtons from '@/components/Buttons/ShortcutButtons'
import TransactionList from '@/components/TransactionList'
import { useScrollContext } from '@/contexts/scroll'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import ReceiveModal from '@/modals/ReceiveModal'
import SendModalTransfer from '@/modals/SendModals/Transfer'
import FiltersPanel from '@/pages/UnlockedWallet/TransfersPage/FiltersPanel'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import UnlockedWalletPage from '@/pages/UnlockedWallet/UnlockedWalletPage'
import { selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { transfersPageInfoMessageClosed } from '@/storage/global/globalActions'
import { walletSidebarWidthPx } from '@/style/globalStyles'
import { Asset } from '@/types/assets'
import { links } from '@/utils/links'
import { directionOptions } from '@/utils/transactions'

interface TransfersPageProps {
  className?: string
}

const TransfersPage = ({ className }: TransfersPageProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const infoMessageClosed = useAppSelector((s) => s.global.transfersPageInfoMessageClosed)
  const addresses = useAppSelector(selectAllAddresses)
  const { scrollDirection } = useScrollContext()
  const defaultAddress = useAppSelector(selectDefaultAddress)

  const [direction, setDirection] = useState(scrollDirection?.get())
  const [selectedAddresses, setSelectedAddresses] = useState(addresses)
  const [selectedDirections, setSelectedDirections] = useState(directionOptions)
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>()
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false)

  const closeInfoMessage = () => dispatch(transfersPageInfoMessageClosed())

  useEffect(() => {
    scrollDirection?.on('change', setDirection)

    return () => scrollDirection?.destroy()
  }, [scrollDirection])

  return (
    <UnlockedWalletPage
      title={t('Transfers')}
      subtitle={t('Browse and download your transaction history. Execute new transfers easily.')}
      isInfoMessageVisible={!infoMessageClosed}
      closeInfoMessage={closeInfoMessage}
      infoMessageLink={links.faq}
      infoMessage={t('You have questions about transfers ? Click here!')}
      className={className}
    >
      <FiltersPanel
        selectedAddresses={selectedAddresses}
        setSelectedAddresses={setSelectedAddresses}
        selectedDirections={selectedDirections}
        setSelectedDirections={setSelectedDirections}
        selectedAssets={selectedAssets}
        setSelectedAssets={setSelectedAssets}
      />
      <StyledUnlockedWalletPanel doubleTop bottom backgroundColor="background1">
        <TransactionList
          addressHashes={map(selectedAddresses, 'hash')}
          directions={map(selectedDirections, 'value')}
          assetIds={map(selectedAssets, 'id')}
          hideHeader
        />
      </StyledUnlockedWalletPanel>
      <BottomRow
        animate={{ y: direction === 'down' ? 100 : 0 }}
        transition={{ easings: 'spring', stiffness: 500, damping: 40 }}
      >
        <CornerButtons>
          <ButtonsGrid>
            <ShortcutButtons receive send highlight analyticsOrigin="transfer_page" />
          </ButtonsGrid>
        </CornerButtons>
      </BottomRow>
      <ModalPortal>
        {isSendModalOpen && defaultAddress && (
          <SendModalTransfer
            initialTxData={{ fromAddress: defaultAddress }}
            onClose={() => setIsSendModalOpen(false)}
          />
        )}
        {isReceiveModalOpen && <ReceiveModal onClose={() => setIsReceiveModalOpen(false)} />}
      </ModalPortal>
    </UnlockedWalletPage>
  )
}

export default TransfersPage

const BottomRow = styled(motion.div)`
  position: fixed;
  bottom: 25px;
  width: calc(100% - ${walletSidebarWidthPx}px);
  display: flex;
  justify-content: center;
  z-index: 1;
`

const CornerButtons = styled.div`
  position: absolute;
  bottom: 0;
  border-radius: 100px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => colord(theme.bg.tertiary).alpha(0.7).toHex()};
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadow.secondary};
  width: 20vw;
  max-width: 320px;
  min-width: 230px;
`

const ButtonsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
`

const StyledUnlockedWalletPanel = styled(UnlockedWalletPanel)`
  flex: 1;
`
