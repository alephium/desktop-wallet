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

import { Fragment } from 'react'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Box from '@/components/Box'
import HorizontalDivider from '@/components/PageComponents/HorizontalDivider'
import { useAppSelector } from '@/hooks/redux'
import { AssetAmount } from '@/types/tokens'
import { ALPH } from '@/utils/constants'
import { getAssetAmounts } from '@/utils/transactions'

interface CheckAmountsBoxProps {
  assetAmounts: AssetAmount[]
  className?: string
}

const CheckAmountsBox = ({ assetAmounts, className }: CheckAmountsBoxProps) => {
  const { attoAlphAmount, tokens } = getAssetAmounts(assetAmounts)
  const tokensInfo = useAppSelector((state) => state.tokens.entities)

  return (
    <Box className={className}>
      <AssetAmountRow>
        <AssetLogoStyled asset={{ id: ALPH.id }} size={30} />
        <AssetAmountStyled value={BigInt(attoAlphAmount)} />
      </AssetAmountRow>
      {tokens.map((token) => {
        const tokenInfo = tokensInfo[token.id]

        return (
          <Fragment key={token.id}>
            <HorizontalDivider />
            <AssetAmountRow>
              {tokenInfo && <AssetLogoStyled asset={tokenInfo} size={30} />}
              <AssetAmountStyled
                value={BigInt(token.amount)}
                suffix={tokenInfo?.symbol}
                decimals={tokenInfo?.decimals}
              />
            </AssetAmountRow>
          </Fragment>
        )
      })}
    </Box>
  )
}

export default CheckAmountsBox

const AssetAmountRow = styled.div`
  display: flex;
  padding: 23px 0;
  justify-content: center;
  align-items: center;
`

const AssetLogoStyled = styled(AssetLogo)`
  margin-right: 25px;
`

const AssetAmountStyled = styled(Amount)`
  font-weight: var(--fontWeight-semiBold);
  font-size: 26px;
`
