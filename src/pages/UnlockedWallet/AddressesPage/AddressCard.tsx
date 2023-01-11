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

import { convertSetToAlph } from '@alephium/sdk'
import { colord } from 'colord'
import dayjs from 'dayjs'
import { motion } from 'framer-motion'
import { MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { TooltipWrapper } from 'react-tooltip'
import styled, { css, useTheme } from 'styled-components'

import AddressEllipsed from '@/components/AddressEllipsed'
import Amount from '@/components/Amount'
import Badge from '@/components/Badge'
import { AddressHash, useAddressesContext } from '@/contexts/addresses'
import { ReactComponent as RibbonSVG } from '@/images/ribbon.svg'
import { useGetPriceQuery } from '@/store/priceApiSlice'
import { currencies } from '@/utils/currencies'

interface AddressCardProps {
  hash: AddressHash
  className?: string
}

const AddressCard = ({ hash, className }: AddressCardProps) => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const theme = useTheme()
  const { getAddress, mainAddress, updateAddressSettings } = useAddressesContext()
  const { data: price, isLoading: isPriceLoading } = useGetPriceQuery(currencies.USD.ticker)

  const address = getAddress(hash)

  if (!address) return null

  const alphBalance = parseFloat(convertSetToAlph(BigInt(address.details.balance)))
  const fiatBalance = alphBalance * (price ?? 0)
  // TODO: Fetch tokens from explorer API and store in Redux
  const tokens: string[] = address.details.balance !== '0' ? ['ALPH'] : []

  const navigateToAddressDetailsPage = (hash: AddressHash) => () => navigate(`/wallet/addresses/${hash}`)

  const setAsDefaultAddress = (event: MouseEvent<HTMLDivElement>) => {
    mainAddress && updateAddressSettings(mainAddress, { ...mainAddress?.settings, isMain: false })
    updateAddressSettings(address, { ...address.settings, isMain: true })
    event.stopPropagation()
  }

  return (
    <Card
      className={className}
      onClick={navigateToAddressDetailsPage(address.hash)}
      onKeyPress={navigateToAddressDetailsPage(address.hash)}
      layout
    >
      <InfoSection bgColor={address.settings.color}>
        {address.settings.isMain ? (
          <DefaultAddressRibbonContainer>
            <TooltipWrapper content={t('This is the default address')} place="bottom">
              <DefaultAddressRibbon />
            </TooltipWrapper>
          </DefaultAddressRibbonContainer>
        ) : (
          <RibbonContainer onClick={setAsDefaultAddress}>
            <TooltipWrapper content={t('Set as the default address')} place="bottom">
              <Ribbon />
            </TooltipWrapper>
          </RibbonContainer>
        )}
        <Label>{address.settings.label}</Label>
        <TotalBalance>
          {!isPriceLoading && <Amount value={fiatBalance} isFiat suffix={currencies.USD.symbol} />}
        </TotalBalance>
        <AddressEllipsedStyled addressHash={address.hash} />
        <LastActivity>
          {address.lastUsed ? `${t('Last activity')} ${dayjs(address.lastUsed).fromNow()}` : t('Never used')}
        </LastActivity>
      </InfoSection>
      <TokensSection>
        {tokens.map((token) => (
          <Badge rounded border transparent color={theme.font.secondary} key={token}>
            {token}
          </Badge>
        ))}
      </TokensSection>
    </Card>
  )
}

export default AddressCard

const RibbonContainer = styled.div`
  position: absolute;
  top: -4px;
  right: 25px;
  opacity: 0;
  transition: opacity 0.2s ease-out;
`

const Card = styled(motion.div)`
  width: 222px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-huge);
  background-color: ${({ theme }) => theme.bg.primary};
  box-shadow: 0px 7px 15px 0px rgba(0, 0, 0, 0.15);
  cursor: pointer;

  &:hover {
    ${RibbonContainer} {
      opacity: 1;
    }
  }
`

const InfoSection = styled.div<{ bgColor?: string }>`
  position: relative;
  padding: 23px 23px 15px 23px;
  border-top-left-radius: var(--radius-huge);
  border-top-right-radius: var(--radius-huge);

  ${({ theme, bgColor }) =>
    bgColor &&
    css`
      background: linear-gradient(0deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08)),
        linear-gradient(252.71deg, ${colord(bgColor).darken(0.15).toRgbString()} 5.31%, ${bgColor} 97.85%);
      color: ${theme.name === 'dark'
        ? colord(bgColor).isDark()
          ? theme.font.primary
          : theme.font.contrastPrimary
        : colord(bgColor).isDark()
        ? theme.font.contrastPrimary
        : theme.font.primary};
    `}
`

const TokensSection = styled.div`
  padding: 23px;
  border-top: 1px solid ${({ theme }) => theme.border.primary};
`

const LastActivity = styled.div`
  color: ${({ theme }) => theme.font.secondary}
  font-size: 11px;
  margin-top: 25px;
`

const AddressEllipsedStyled = styled(AddressEllipsed)`
  font-size: 16px;
  font-weight: var(--fontWeight-medium);
`

const Ribbon = styled(RibbonSVG)`
  opacity: 0.4;
  transition: opacity 0.2s ease-out;

  &:hover {
    opacity: 0.6;
  }
`

const DefaultAddressRibbonContainer = styled(RibbonContainer)`
  opacity: 1;
`

const DefaultAddressRibbon = styled(RibbonSVG)`
  opacity: 1;
  filter: drop-shadow(0px 3px 2px rgba(0, 0, 0, 0.1));
  cursor: auto;
`

const Label = styled.div`
  font-size: 23px;
  font-weight: var(--fontWeight-normal);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 95%;
  display: inline-block;
  min-height: 28px;
  margin-bottom: 25px;
`

const TotalBalance = styled.div`
  font-size: 28px;
  font-weight: var(--fontWeight-semiBold);
  margin-bottom: 10px;
`
