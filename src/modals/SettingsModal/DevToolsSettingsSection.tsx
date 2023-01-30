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

import { FileCode, TerminalSquare } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import InlineLabelValueInput from '@/components/Inputs/InlineLabelValueInput'
import Toggle from '@/components/Inputs/Toggle'
import { Section } from '@/components/PageComponents/PageContainers'
import { useGlobalContext } from '@/contexts/global'

import ModalPortal from '../ModalPortal'
import SendModalDeployContract from '../SendModals/SendModalDeployContract'
import SendModalScript from '../SendModals/SendModalScript'

const DevToolsSettingsSection = () => {
  const { t } = useTranslation()
  const {
    settings: {
      general: { devTools }
    },
    updateSettings
  } = useGlobalContext()

  const [isDeployContractSendModalOpen, setIsDeployContractSendModalOpen] = useState(false)
  const [isCallScriptSendModalOpen, setIsCallScriptSendModalOpen] = useState(false)

  return (
    <>
      <Section align="flex-start">
        <Box>
          <InlineLabelValueInput
            label={t('Enable developer tools')}
            description={t('Deploy and call smart contracts')}
            InputComponent={
              <Toggle
                label={t('Enable developer tools')}
                toggled={devTools}
                onToggle={() => updateSettings('general', { devTools: !devTools })}
              />
            }
          />
        </Box>
      </Section>
      {devTools && (
        <DevToolsSection inList>
          <Button Icon={FileCode} onClick={() => setIsDeployContractSendModalOpen(true)} role="secondary">
            {t('Deploy contract')}
          </Button>
          <Button Icon={TerminalSquare} onClick={() => setIsCallScriptSendModalOpen(true)} role="secondary">
            {t('Call contract')}
          </Button>
        </DevToolsSection>
      )}
      <ModalPortal>
        {isDeployContractSendModalOpen && (
          <SendModalDeployContract onClose={() => setIsDeployContractSendModalOpen(false)} />
        )}
        {isCallScriptSendModalOpen && <SendModalScript onClose={() => setIsCallScriptSendModalOpen(false)} />}
      </ModalPortal>
    </>
  )
}

export default DevToolsSettingsSection

const DevToolsSection = styled(Section)`
  flex-direction: row;
  gap: var(--spacing-4);
`
