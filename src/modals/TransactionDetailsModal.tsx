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

import { addApostrophes } from '@alephium/sdk'
import { partition } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import ActionLink from '@/components/ActionLink'
import AddressBadge from '@/components/AddressBadge'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import ExpandableSection from '@/components/ExpandableSection'
import HashEllipsed from '@/components/HashEllipsed'
import IOList from '@/components/IOList'
import Tooltip from '@/components/Tooltip'
import { useAppSelector } from '@/hooks/redux'
import { useTransactionUI } from '@/hooks/useTransactionUI'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import { ModalHeader } from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import SideModal from '@/modals/SideModal'
import { selectAddressIds } from '@/storage/addresses/addressesSelectors'
import { Address, AddressHash } from '@/types/addresses'
import { AddressConfirmedTransaction } from '@/types/transactions'
import { formatDateForDisplay, openInWebBrowser } from '@/utils/misc'
import { getTransactionInfo } from '@/utils/transactions'

interface TransactionDetailsModalProps {
  transaction: AddressConfirmedTransaction
  address: Address
  onClose: () => void
}

interface DetailsRowProps {
  label: string
  className?: string
}

const TransactionDetailsModal = ({ transaction, address, onClose }: TransactionDetailsModalProps) => {
  const { t } = useTranslation()
  const { explorerUrl } = useAppSelector((state) => state.network.settings)
  const internalAddressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const theme = useTheme()
  const { assets, direction, lockTime, infoType } = getTransactionInfo(transaction)
  const { label, Icon } = useTransactionUI(infoType)

  const isMoved = infoType === 'move'

  const [selectedAddressHash, setSelectedAddressHash] = useState<AddressHash>()

  const handleShowTxInExplorer = () => openInWebBrowser(`${explorerUrl}/#/transactions/${transaction.hash}`)

  const handleShowAddress = (addressHash: AddressHash) =>
    internalAddressHashes.includes(addressHash)
      ? setSelectedAddressHash(addressHash)
      : openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)

  const [knownAssets, unknownAssets] = partition(assets, (asset) => !!asset.symbol)

  return (
    <SideModal onClose={onClose} title={t('Transaction details')} hideHeader>
      <Header>
        <AmountWrapper tabIndex={0}>
          {knownAssets.map(({ id, amount, decimals, symbol }) => (
            <AmountContainer key={id}>
              <Amount
                tabIndex={0}
                value={amount}
                decimals={decimals}
                suffix={symbol}
                highlight={!isMoved}
                showPlusMinus={!isMoved}
              />
            </AmountContainer>
          ))}
        </AmountWrapper>
        <HeaderInfo>
          <Direction>
            <Icon size={14} />
            {label}
          </Direction>
          <FromIn>
            {
              {
                in: t('from'),
                out: t('to'),
                swap: t('between')
              }[direction]
            }
          </FromIn>
          <AddressBadgeStyled addressHash={address.hash} truncate withBorders />
          {direction === 'swap' && (
            <>
              <FromIn>{t('and')}</FromIn>
              <SwapPartnerAddress>
                <IOList
                  currentAddress={address.hash}
                  isOut={false}
                  outputs={transaction.outputs}
                  inputs={transaction.inputs}
                  timestamp={transaction.timestamp}
                  linkToExplorer
                />
              </SwapPartnerAddress>
            </>
          )}
        </HeaderInfo>
        <ActionLink onClick={handleShowTxInExplorer}>↗ {t('Show in explorer')}</ActionLink>
      </Header>
      <Details role="table">
        {direction !== 'swap' && (
          <>
            <DetailsRow label={t('From')}>
              {direction === 'out' ? (
                <AddressList>
                  <ActionLinkStyled onClick={() => handleShowAddress(address.hash)} key={address.hash}>
                    <AddressBadge addressHash={address.hash} truncate />
                  </ActionLinkStyled>
                </AddressList>
              ) : (
                <IOList
                  currentAddress={address.hash}
                  isOut={false}
                  outputs={transaction.outputs}
                  inputs={transaction.inputs}
                  timestamp={transaction.timestamp}
                  linkToExplorer
                />
              )}
            </DetailsRow>
            <DetailsRow label={t('To')}>
              {direction !== 'out' ? (
                <AddressList>
                  <ActionLinkStyled onClick={() => handleShowAddress(address.hash)} key={address.hash}>
                    <AddressBadge addressHash={address.hash} withBorders />
                  </ActionLinkStyled>
                </AddressList>
              ) : (
                <IOList
                  currentAddress={address.hash}
                  isOut={direction === 'out'}
                  outputs={transaction.outputs}
                  inputs={transaction.inputs}
                  timestamp={transaction.timestamp}
                  linkToExplorer
                />
              )}
            </DetailsRow>
          </>
        )}
        <DetailsRow label={t`Status`}>
          <Badge color={theme.global.valid} border>
            <span tabIndex={0}>{t`Confirmed`}</span>
          </Badge>
        </DetailsRow>
        <DetailsRow label={t`Timestamp`}>
          <span tabIndex={0}>{formatDateForDisplay(transaction.timestamp)}</span>
        </DetailsRow>
        {lockTime && (
          <DetailsRow label={lockTime < new Date() ? t`Unlocked at` : t`Unlocks at`}>
            <span tabIndex={0}>{formatDateForDisplay(lockTime)}</span>
          </DetailsRow>
        )}
        <DetailsRow label={t`Fee`}>
          <Amount tabIndex={0} value={BigInt(transaction.gasAmount) * BigInt(transaction.gasPrice)} />
        </DetailsRow>
        <DetailsRow label={t`Total value`}>
          <Amounts>
            {knownAssets.map(({ id, amount, decimals, symbol }) => (
              <AmountContainer key={id}>
                <Amount
                  tabIndex={0}
                  value={amount}
                  fullPrecision
                  decimals={decimals}
                  suffix={symbol}
                  isUnknownToken={!symbol}
                  highlight={!isMoved}
                  showPlusMinus={!isMoved}
                />
                {!symbol && <TokenHash hash={id} />}
              </AmountContainer>
            ))}
          </Amounts>
        </DetailsRow>
        {unknownAssets.length > 0 && (
          <DetailsRow label={t('Unknown tokens')}>
            <Amounts>
              {unknownAssets.map(({ id, amount, decimals, symbol }) => (
                <AmountContainer key={id}>
                  <Amount tabIndex={0} value={amount} isUnknownToken={!symbol} highlight />
                  {!symbol && <TokenHash hash={id} />}
                </AmountContainer>
              ))}
            </Amounts>
          </DetailsRow>
        )}
        <ExpandableSectionStyled sectionTitleClosed={t`Click to see more`} sectionTitleOpen={t`Click to see less`}>
          <DetailsRow label={t`Gas amount`}>
            <span tabIndex={0}>{addApostrophes(transaction.gasAmount.toString())}</span>
          </DetailsRow>
          <DetailsRow label={t`Gas price`}>
            <Amount tabIndex={0} value={BigInt(transaction.gasPrice)} fullPrecision />
          </DetailsRow>
          <DetailsRow label={t`Inputs`}>
            <AddressList>
              {transaction.inputs?.map(
                (input) =>
                  input.address && (
                    <ActionLinkStyled
                      key={`${input.outputRef.key}`}
                      onClick={() => handleShowAddress(input.address as string)}
                    >
                      <HashEllipsed key={`${input.outputRef.key}`} hash={input.address} />
                    </ActionLinkStyled>
                  )
              )}
            </AddressList>
          </DetailsRow>
          <DetailsRow label={t`Outputs`}>
            <AddressList>
              {transaction.outputs?.map((output) => (
                <ActionLinkStyled key={`${output.key}`} onClick={() => handleShowAddress(output.address ?? '')}>
                  <HashEllipsed key={`${output.key}`} hash={output.address} />
                </ActionLinkStyled>
              ))}
            </AddressList>
          </DetailsRow>
        </ExpandableSectionStyled>
      </Details>
      <Tooltip />
      <ModalPortal>
        {selectedAddressHash && (
          <AddressDetailsModal addressHash={selectedAddressHash} onClose={() => setSelectedAddressHash(undefined)} />
        )}
      </ModalPortal>
    </SideModal>
  )
}

export default TransactionDetailsModal

let DetailsRow: FC<DetailsRowProps> = ({ children, label, className }) => (
  <div className={className} role="row">
    <DetailsRowLabel tabIndex={0} role="cell">
      {label}
    </DetailsRowLabel>
    {children}
  </div>
)

DetailsRow = styled(DetailsRow)`
  padding: 12px var(--spacing-3);
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  justify-content: space-between;
  min-height: 52px;

  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const Direction = styled.span`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 5px;
`

const AmountWrapper = styled.div`
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
  max-width: 100%;
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

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: 28px;
`

const AddressList = styled.div`
  overflow: hidden;
`

const ActionLinkStyled = styled(ActionLink)`
  width: 100%;
  justify-content: right;
`

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`

const TokenHash = styled(HashEllipsed)`
  max-width: 80px;
  color: ${({ theme }) => theme.font.primary};
`

const AddressBadgeStyled = styled(AddressBadge)`
  max-width: 200px;
`

const SwapPartnerAddress = styled.div`
  max-width: 80px;
`
