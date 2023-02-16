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
import styled, { useTheme } from 'styled-components'

import DotIcon from '@/components/DotIcon'
import { useAppSelector } from '@/hooks/redux'
import i18n from '@/i18n'

interface StepsProgressProps {
  currentStep: Step
  className?: string
}

export type Step = 'build-tx' | 'info-check' | 'password-check' | 'tx-sent'

type StepStatus = 'completed' | 'active' | 'next'

const stepTitles: Record<Step, string> = {
  'build-tx': i18n.t('Info'),
  'info-check': i18n.t('Check'),
  'password-check': i18n.t('Confirm'),
  'tx-sent': i18n.t('Sent')
}

const dotSize = 16

const StepsProgress = ({ currentStep, className }: StepsProgressProps) => {
  const { steps, getStepColors } = useStepsUI(currentStep)

  return (
    <div className={className}>
      {steps.map((step, index) => {
        const { text, dot, line } = getStepColors(step)

        return (
          <Fragment key={step}>
            <StepIndicator>
              <DotIcon color={dot} strokeColor={text} size={dotSize} />
              <StepTitle style={{ color: text }}>{stepTitles[step]}</StepTitle>
            </StepIndicator>
            {index < steps.length - 1 && <Line color={line} />}
          </Fragment>
        )
      })}
    </div>
  )
}

const useStepsUI = (currentStep: Step) => {
  const theme = useTheme()
  const settings = useAppSelector((s) => s.settings)

  const steps: Step[] = !settings.passwordRequirement
    ? ['build-tx', 'info-check', 'tx-sent']
    : ['build-tx', 'info-check', 'password-check', 'tx-sent']

  const getStepStatus = (step: Step): StepStatus =>
    steps.indexOf(step) < steps.indexOf(currentStep)
      ? 'completed'
      : steps.indexOf(step) === steps.indexOf(currentStep)
      ? 'active'
      : 'next'

  const textColor: Record<StepStatus, string> = {
    completed: theme.global.valid,
    active: theme.font.primary,
    next: theme.font.tertiary
  }

  const dotFill: Record<StepStatus, string> = {
    completed: theme.global.valid,
    active: theme.font.primary,
    next: 'transparent'
  }

  const line: Record<StepStatus, string> = {
    completed: theme.global.valid,
    active: theme.font.tertiary,
    next: theme.font.tertiary
  }

  const getStepColors = (step: Step) => {
    const status = getStepStatus(step)

    return {
      text: textColor[status],
      dot: dotFill[status],
      line: line[status]
    }
  }

  return { steps, getStepColors }
}

export default styled(StepsProgress)`
  padding: 38px 100px 0px;
  width: 100%;
  display: flex;
  justify-content: space-between;
`

const StepIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-bottom: 28px;
`

const StepTitle = styled.span`
  font-size: 12px;
  position: absolute;
  top: 28px;
  transition: color 0.3s ease-out;
`

const Line = styled.div<{ color: string }>`
  flex-grow: 1;
  height: 1px;
  background-color: ${({ color }) => color};
  margin-top: ${dotSize / 2}px;
  transition: background-color 0.3s ease-out;
`
