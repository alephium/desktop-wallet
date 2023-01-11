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

import { formatAmountForDisplay } from '@alephium/sdk'
import { useTranslation } from 'react-i18next'

import AlefSymbol from '@/components/AlefSymbol'
import InfoBox from '@/components/InfoBox'

interface AlphAmountInfoBoxProps {
  amount: bigint
  label?: string
  fullPrecision?: boolean
}

const AlphAmountInfoBox = ({ amount, label, fullPrecision = false }: AlphAmountInfoBoxProps) => {
  const { t } = useTranslation()

  return (
    <InfoBox label={label ?? t`Amount`}>
      {formatAmountForDisplay(amount, fullPrecision, !fullPrecision ? 7 : undefined)} <AlefSymbol />
    </InfoBox>
  )
}

export default AlphAmountInfoBox
