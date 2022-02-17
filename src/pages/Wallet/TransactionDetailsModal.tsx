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

import { addApostrophe, calAmountDelta } from 'alephium-js'
import { Transaction } from 'alephium-js/dist/api/api-explorer'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { FC } from 'react'
import styled, { DefaultTheme, useTheme } from 'styled-components'

import ActionLink from '../../components/ActionLink'
import Amount from '../../components/Amount'
import ExpandableSection from '../../components/ExpandableSection'
import IOList from '../../components/IOList'
import Label from '../../components/Label'
import Modal from '../../components/Modal'
import { ModalHeader } from '../../components/ModalCentered'
import { Address, AddressHash } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import { openInWebBrowser } from '../../utils/misc'

interface TransactionDetailsModalProps {
  transaction: Transaction
  address: Address
  onClose: () => void
}

const TransactionDetailsModal = ({ transaction, address, onClose }: TransactionDetailsModalProps) => {
  const {
    settings: {
      network: { explorerUrl }
    }
  } = useGlobalContext()
  const theme = useTheme()
  let amount = calAmountDelta(transaction, address.hash)
  const isOutgoingTx = amount < 0
  amount = isOutgoingTx ? amount * -1n : amount

  const handleShowTxInExplorer = () => {
    openInWebBrowser(`${explorerUrl}/#/transactions/${transaction.hash}`)
  }

  const handleShowAddressInExplorer = (address: AddressHash) => {
    openInWebBrowser(`${explorerUrl}/#/addresses/${address}`)
  }

  return (
    <Modal onClose={onClose} hasPadding={false}>
      <Sidebar
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <Header contrast>
          <AmountWrapper type={isOutgoingTx ? 'minus' : 'plus'}>
            <span>{isOutgoingTx ? '-' : '+'}</span> <Amount value={amount} fadeDecimals />
          </AmountWrapper>
          <HeaderInfo>
            {isOutgoingTx ? '↑ Sent' : '↓ Received'}
            <FromIn>{isOutgoingTx ? 'from' : 'in'}</FromIn>
            <Label color={address.settings.color}>{address.labelDisplay()}</Label>
          </HeaderInfo>
          <ActionLink onClick={handleShowTxInExplorer}>↗ Show in explorer</ActionLink>
        </Header>
        <Details>
          <DetailsRow label="From">
            {isOutgoingTx ? (
              <Label color={address.settings.color}>{address.labelDisplay()}</Label>
            ) : (
              <IOList
                currentAddress={address.hash}
                isOut={isOutgoingTx}
                outputs={transaction.outputs}
                inputs={transaction.inputs}
                timestamp={transaction.timestamp}
                linkToExplorer
              />
            )}
          </DetailsRow>
          <DetailsRow label="To">
            {!isOutgoingTx ? (
              <Label color={address.settings.color}>{address.labelDisplay()}</Label>
            ) : (
              <IOList
                currentAddress={address.hash}
                isOut={isOutgoingTx}
                outputs={transaction.outputs}
                inputs={transaction.inputs}
                timestamp={transaction.timestamp}
                linkToExplorer
              />
            )}
          </DetailsRow>
          <DetailsRow label="Status">
            <Label color={theme.badge.font.plus} border>
              Confirmed
            </Label>
          </DetailsRow>
          <DetailsRow label="Timestamp">
            {dayjs(transaction.timestamp).format('YYYY-MM-DD [at] HH:mm:ss [UTC]Z')}
          </DetailsRow>
          <DetailsRow label="Fee">
            {<Amount value={BigInt(transaction.gasAmount) * BigInt(transaction.gasPrice)} fadeDecimals />}
          </DetailsRow>
          <DetailsRow label="Total value">{<Amount value={amount} fadeDecimals fullPrecision />}</DetailsRow>
          <ExpandableSectionStyled sectionTitleClosed="Click to see more" sectionTitleOpen="Click to see less">
            <DetailsRow label="Gas amount">{addApostrophe(transaction.gasAmount.toString())}</DetailsRow>
            <DetailsRow label="Gas price">
              <Amount value={BigInt(transaction.gasPrice)} fadeDecimals fullPrecision />
            </DetailsRow>
            <DetailsRow label="Inputs">
              <IOs>
                {transaction.inputs?.map((input) => (
                  <ActionLink key={`${input.outputRef.key}`} onClick={() => handleShowAddressInExplorer(input.address)}>
                    {input.address}
                  </ActionLink>
                ))}
              </IOs>
            </DetailsRow>
            <DetailsRow label="Outputs">
              <IOs>
                {transaction.outputs?.map((output) => (
                  <ActionLink key={`${output.key}`} onClick={() => handleShowAddressInExplorer(output.address)}>
                    {output.address}
                  </ActionLink>
                ))}
              </IOs>
            </DetailsRow>
          </ExpandableSectionStyled>
        </Details>
      </Sidebar>
    </Modal>
  )
}

interface DetailsRowProps {
  label: string
  className?: string
}

let DetailsRow: FC<DetailsRowProps> = ({ children, label, className }) => (
  <div className={className}>
    <DetailsRowLabel>{label}</DetailsRowLabel>
    {children}
  </div>
)

DetailsRow = styled(DetailsRow)`
  padding: 12px var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;

  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const AmountWrapper = styled.div<{ type: keyof DefaultTheme['badge']['font'] }>`
  color: ${({ type, theme }) => theme.badge.font[type]};
  font-size: 26px;
  font-weight: var(--fontWeight-semiBold);
`

const Header = styled(ModalHeader)`
  padding: 35px;
  display: flex;
  align-items: center;
  flex-direction: column;
`

const HeaderInfo = styled.div`
  display: flex;
  gap: 8px;
  font-weight: var(--fontWeight-semiBold);
  align-items: center;
  margin-top: var(--spacing-3);
  margin-bottom: var(--spacing-5);
`

const FromIn = styled.span`
  color: ${({ theme }) => theme.font.secondary};
`

const Details = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
`

const DetailsRowLabel = styled.div`
  font-weight: var(--fontWeight-medium);
`

const Sidebar = styled(motion.div)`
  display: flex;
  flex-direction: column;
  margin-left: auto;
  width: 100%;
  max-width: 476px;
  height: 100vh;
  background-color: ${({ theme }) => theme.bg.primary};
  z-index: 1;
  position: relative;
  overflow: auto;
`

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 28px;
`

const IOs = styled.div`
  text-align: right;
`

export default TransactionDetailsModal
