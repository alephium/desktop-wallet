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

import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import { Codesandbox, HardHat, Lightbulb, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import styled, { useTheme } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import AddressEllipsed from '@/components/AddressEllipsed'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import InfoMessage from '@/components/InfoMessage'
import InlineLabelValueInput from '@/components/Inputs/InlineLabelValueInput'
import Toggle from '@/components/Inputs/Toggle'
import MainAddressLabel from '@/components/MainAddressLabel'
import OperationBox from '@/components/OperationBox'
import Spinner from '@/components/Spinner'
import Table, { TableCell, TableFooter, TableProps, TableRow } from '@/components/Table'
import { AddressHash, useAddressesContext } from '@/contexts/addresses'
import { useGlobalContext } from '@/contexts/global'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressDiscovery from '@/hooks/useAddressDiscovery'
import AddressSweepModal from '@/modals/AddressSweepModal'
import NewAddressModal from '@/modals/NewAddressModal'
import { addressesPageInfoMessageClosed } from '@/store/appSlice'
import { sortAddressList } from '@/utils/addresses'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

const addressesTableHeaders: TableProps['headers'] = [
  { title: 'Address', width: '96px' },
  { title: 'Label', width: '100px' },
  { title: 'Last used', width: '100px' },
  { title: 'Transactions', width: '105px' },
  { title: 'Group', width: '50px' },
  { title: 'ALPH amount', align: 'end', width: '80px' }
]

const tableColumnWidths = addressesTableHeaders.map(({ width }) => width)

const AddressesPage = () => {
  const { t } = useTranslation('App')
  const navigate = useNavigate()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const { addresses, generateOneAddressPerGroup } = useAddressesContext()
  const { isPassphraseUsed } = useGlobalContext()
  const [activeWalletMnemonic, infoMessageClosed] = useAppSelector((s) => [
    s.activeWallet.mnemonic,
    s.app.addressesPageInfoMessageClosed
  ])
  const discoverAndSaveActiveAddresses = useAddressDiscovery()

  const [isGenerateNewAddressModalOpen, setIsGenerateNewAddressModalOpen] = useState(false)
  const [isAdvancedSectionOpen, setIsAdvancedSectionOpen] = useState(false)
  const [isConsolidationModalOpen, setIsConsolidationModalOpen] = useState(false)
  const [isAddressesGenerationModalOpen, setIsAddressesGenerationModalOpen] = useState(false)

  const navigateToAddressDetailsPage = (addressHash: AddressHash) => () => navigate(`/wallet/addresses/${addressHash}`)

  const handleOneAddressPerGroupClick = () => {
    if (isPassphraseUsed) {
      generateOneAddressPerGroup()
    } else {
      setIsAddressesGenerationModalOpen(true)
    }
  }

  const closeInfoMessage = () => dispatch(addressesPageInfoMessageClosed())

  const balanceSummary = addresses.reduce((acc, row) => acc + BigInt(row.details ? row.details.balance : 0), BigInt(0))

  useEffect(() => {
    ReactTooltip.rebuild()
  }, [])

  if (!activeWalletMnemonic) return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <MainPanel>
        <Header>
          <div>
            <Title>{t`Addresses & contacts`}</Title>
            <Subtitle>{t`Easily organize your addresses and your contacts for a more serene transfer experience. Sync with the mobile wallet to be more organized on the go.`}</Subtitle>
          </div>
          <div>
            <AnimatePresence>
              {!infoMessageClosed && (
                <InfoMessage link={links.faq} onClose={closeInfoMessage}>
                  {t`Want to know more? Click here to take a look at our FAQ!`}
                </InfoMessage>
              )}
            </AnimatePresence>
          </div>
        </Header>
        <Table headers={addressesTableHeaders} minWidth="580px">
          {sortAddressList(addresses).map((address) => (
            <TableRow
              key={address.hash}
              columnWidths={tableColumnWidths}
              role="row"
              onClick={navigateToAddressDetailsPage(address.hash)}
              onKeyPress={navigateToAddressDetailsPage(address.hash)}
            >
              <TableCellStyled role="cell" tabIndex={0}>
                <AddressEllipsed addressHash={address.hash} />
                {!isPassphraseUsed && address.settings.isMain && <MainAddressLabel />}
              </TableCellStyled>
              <TableCell role="cell" tabIndex={0}>
                {address.settings.label ? <AddressBadge address={address} truncate hideStar /> : '-'}
              </TableCell>
              <TableCell role="cell" tabIndex={0}>
                {address.lastUsed ? dayjs(address.lastUsed).fromNow() : '-'}
              </TableCell>
              <TableCell role="cell" tabIndex={0}>
                {address.details?.txNumber ?? 0}
              </TableCell>
              <TableCell role="cell" tabIndex={0}>
                {address.group}
              </TableCell>
              <TableCellAmount role="cell" tabIndex={0} align="end">
                {address.transactions.pending.length > 0 && <Spinner size="12px" />}
                <Amount value={BigInt(address.details?.balance ?? 0)} fadeDecimals />
              </TableCellAmount>
            </TableRow>
          ))}
          <TableFooterStyled>
            <TableCell>
              <ActionLink onClick={() => setIsGenerateNewAddressModalOpen(true)}>
                + {t`Generate new address`}
              </ActionLink>
            </TableCell>
            <Summary role="cell" tabIndex={0} align="end">
              <Badge border>
                <Amount value={balanceSummary} fadeDecimals />
              </Badge>
            </Summary>
          </TableFooterStyled>
        </Table>
      </MainPanel>
      <AdvancedOperationsPanel>
        <AdvancedOperationsHeader>
          <AdvancedOperationsTitle>{t`Advanced operations`}</AdvancedOperationsTitle>
          <AdvancedOperationsToggle
            label={t`Show advanced operations`}
            description={t`Open the advanced feature panel.`}
            InputComponent={
              <Toggle
                label={t`Show advanced operations`}
                toggled={isAdvancedSectionOpen}
                onToggle={() => setIsAdvancedSectionOpen(!isAdvancedSectionOpen)}
              />
            }
          />
        </AdvancedOperationsHeader>
        <Collapsable
          animate={{
            height: isAdvancedSectionOpen ? 'auto' : 0,
            opacity: isAdvancedSectionOpen ? 1 : 0,
            visibility: isAdvancedSectionOpen ? 'visible' : 'hidden'
          }}
          transition={{ duration: 0.2 }}
        >
          <AdvancedOperations>
            <OperationBox
              title={t`Consolidate UTXOs`}
              Icon={<Codesandbox color="#64f6c2" strokeWidth={1} size={46} />}
              description={t`Consolidate (merge) your UTXOs into one.`}
              buttonText={t`Start`}
              onButtonClick={() => setIsConsolidationModalOpen(true)}
              infoLink={links.utxoConsolidation}
            />
            <OperationBox
              title={t`Generate one address per group`}
              Icon={<HardHat color="#a880ff" strokeWidth={1} size={55} />}
              description={t`Useful for miners or DeFi use.`}
              buttonText={isPassphraseUsed ? t`Generate` : t`Start`}
              onButtonClick={handleOneAddressPerGroupClick}
              infoLink={links.miningWallet}
            />
            <OperationBox
              title={t`Discover active addresses`}
              Icon={<Search color={theme.global.complementary} strokeWidth={1} size={55} />}
              description={t`Scan the blockchain for addresses you used in the past.`}
              buttonText={t`Search`}
              onButtonClick={() => discoverAndSaveActiveAddresses(activeWalletMnemonic)}
              infoLink={links.miningWallet}
            />
            <OperationBox
              placeholder
              title={t`More to come...`}
              Icon={<Lightbulb color={theme.font.secondary} strokeWidth={1} size={28} />}
              description={t`You have great ideas you want to share?`}
              buttonText={t`Tell us!`}
              onButtonClick={() => openInWebBrowser(links.discord)}
            />
          </AdvancedOperations>
        </Collapsable>
      </AdvancedOperationsPanel>
      <AnimatePresence exitBeforeEnter initial={true}>
        {isGenerateNewAddressModalOpen && (
          <NewAddressModal
            singleAddress
            title={t`New address`}
            onClose={() => setIsGenerateNewAddressModalOpen(false)}
          />
        )}
        {isConsolidationModalOpen && <AddressSweepModal onClose={() => setIsConsolidationModalOpen(false)} />}
        {isAddressesGenerationModalOpen && (
          <NewAddressModal
            title={t`Generate one address per group`}
            onClose={() => setIsAddressesGenerationModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AddressesPage

const TableFooterStyled = styled(TableFooter)`
  grid-auto-columns: 1fr;
`

const Summary = styled(TableCell)`
  color: ${({ theme }) => theme.font.highlight};
`

const Collapsable = styled(motion.div)`
  overflow: hidden;
  height: 0;
  opacity: 0;
  visibility: hidden;
`

const AdvancedOperations = styled.div`
  border-radius: var(--radius);
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  padding: 26px 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
`

const TableCellAmount = styled(TableCell)`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`

const TableCellStyled = styled(TableCell)`
  flex-direction: column;
`

const Panel = styled.div`
  padding-left: 60px;
  padding-right: 60px;
`

const MainPanel = styled(Panel)`
  padding-bottom: 30px;
`

const AdvancedOperationsPanel = styled(Panel)`
  padding-top: 10px;
  padding-bottom: 10px;
  border-top: 1px solid ${({ theme }) => theme.border.secondary};
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  margin-top: 35px;
  margin-bottom: 50px;
`

const Title = styled.h1`
  font-size: 26px;
  font-weight: var(--fontWeight-semiBold);
  margin-top: 0;
  margin-bottom: 20px;
`

const Subtitle = styled.div`
  max-width: 394px;
  color: ${({ theme }) => theme.font.tertiary};
`

const AdvancedOperationsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const AdvancedOperationsTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 16px;
  font-weight: var(--fontWeight-medium);
`
const AdvancedOperationsToggle = styled(InlineLabelValueInput)`
  width: 370px;
`
