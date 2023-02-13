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

import Amount from '@/components/Amount'
import Table, { TableRow } from '@/components/Table'
import { useAppSelector } from '@/hooks/redux'
import AlephiumLogoSVG from '@/images/alephium_logo_monochrome.svg'
import { selectTokens } from '@/storage/app-state/slices/tokensSlice'

interface TokensNFTsListProps {
  className?: string
}

const TokensNFTsList = ({ className }: TokensNFTsListProps) => {
  const { t } = useTranslation()
  const tokens = useAppSelector(selectTokens)
  const [isLoadingAddresses, tokensStatus] = useAppSelector((s) => [s.addresses.loading, s.tokens.status])
  const showSkeletonLoading = isLoadingAddresses || tokensStatus === 'uninitialized'

  return (
    <Table isLoading={showSkeletonLoading} className={className} minWidth="500px">
      <TableHeaderRow>
        <TableTitle>
          {t('Tokens')} ({tokens.length})
        </TableTitle>
      </TableHeaderRow>
      {tokens.map((token) => (
        <TableRow key={token.id} role="row" tabIndex={0}>
          <TokenRow>
            <TokenLogo>
              {/* TODO: uncomment when metadata repo is accessible by the public */}
              {/* <LogoImage src={token.logoURI ?? AlephiumLogoSVG} /> */}
              <LogoImage src={AlephiumLogoSVG} />
            </TokenLogo>
            <NameColumn>
              <TokenName>{token.name}</TokenName>
              <TokenSymbol>{token.symbol}</TokenSymbol>
            </NameColumn>
            <Column>
              <TokenAmount fadeDecimals value={token.balance} suffix={token.symbol} />
              {token.lockedBalance > 0 && (
                <TokenLockedAmount fadeDecimals value={token.lockedBalance} suffix={token.symbol} />
              )}
            </Column>
          </TokenRow>
        </TableRow>
      ))}
    </Table>
  )
}

export default styled(TokensNFTsList)`
  margin-bottom: 45px;
`

const TableHeaderRow = styled(TableRow)`
  display: flex;
  justify-content: space-between;
  height: 60px;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const TableTitle = styled.div`
  font-size: 13px;
  font-weight: var(--fontWeight-semiBold);
`

const TokenRow = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`

const TokenLogo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  border-radius: 30px;
  padding: 5px;
  background: linear-gradient(218.53deg, #0075ff 9.58%, #d340f8 86.74%);
  margin-right: 25px;
`

const LogoImage = styled.img`
  width: 100%;
  height: 100%;
`

const TokenName = styled.div`
  font-size: 14px;
  font-weight: var(--fontWeight-semiBold);
  width: 200px;
`

const TokenSymbol = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
`

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const TokenAmount = styled(Amount)`
  color: ${({ theme }) => theme.font.secondary};
`

const TokenLockedAmount = styled(Amount)`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`

const NameColumn = styled(Column)`
  margin-right: 50px;
`
