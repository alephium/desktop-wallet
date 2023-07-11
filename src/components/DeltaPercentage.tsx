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

import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled, { css, useTheme } from 'styled-components'

import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { discreetModeToggled } from '@/storage/settings/settingsActions'

interface DeltaPercentageProps {
  initialValue: number
  latestValue: number
  className?: string
}

const DeltaPercentage = ({ initialValue, latestValue, className }: DeltaPercentageProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const discreetMode = useAppSelector((state) => state.settings.discreetMode)

  const percentage = Math.round(((latestValue - initialValue) / initialValue) * 10000) / 100
  const isUp = percentage >= 0
  const color = discreetMode ? theme.font.primary : isUp ? theme.global.valid : theme.global.alert

  const DirectionArrow = percentage >= 0 ? ArrowUpRight : ArrowDownRight

  return (
    <DeltaPercentageStyled
      className={className}
      style={{ color }}
      discreetMode={discreetMode}
      data-tooltip-id="default"
      data-tooltip-content={discreetMode ? t('Click to deactivate discreet mode') : ''}
      data-tooltip-delay-show={500}
      onClick={() => discreetMode && dispatch(discreetModeToggled())}
    >
      <DirectionArrow color={color} />
      {percentage}%
    </DeltaPercentageStyled>
  )
}

export default DeltaPercentage

const DeltaPercentageStyled = styled.div<{ discreetMode: boolean }>`
  display: flex;
  align-items: center;
  height: 24px;

  ${({ discreetMode }) =>
    discreetMode &&
    css`
      filter: blur(10px);
      overflow: hidden;
      cursor: pointer;
    `}
`
