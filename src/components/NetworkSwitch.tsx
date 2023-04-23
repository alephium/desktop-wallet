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

import { upperFirst } from 'lodash'
import { ArrowRight } from 'lucide-react'
import posthog from 'posthog-js'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Button from '@/components/Button'
import DotIcon from '@/components/DotIcon'
import Select from '@/components/Inputs/Select'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import SettingsModal from '@/modals/SettingsModal'
import { networkPresetSwitched } from '@/storage/settings/networkActions'
import { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import { NetworkName, NetworkNames } from '@/types/network'

interface NetworkSelectOption {
  label: string
  value: NetworkName
}

type NonCustomNetworkName = Exclude<keyof typeof NetworkNames, 'custom' | 'localhost'>

const NetworkSwitch = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const network = useAppSelector((state) => state.network)

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const networkNames = Object.values(NetworkNames).filter(
    (n) => !['custom', 'localhost'].includes(n)
  ) as NonCustomNetworkName[]

  const networkSelectOptions: NetworkSelectOption[] = networkNames.map((networkName) => ({
    label: {
      mainnet: t('Mainnet'),
      testnet: t('Testnet')
    }[networkName],
    value: networkName
  }))

  const handleNetworkPresetChange = useCallback(
    async (networkName: NetworkName) => {
      if (networkName !== network.name) {
        if (networkName === 'custom') {
          // TODO: open settings modal, or reuse previous custom settings if available.
          return
        }

        const newNetworkSettings = networkPresets[networkName]

        const networkId = newNetworkSettings.networkId

        if (networkId !== undefined) {
          dispatch(networkPresetSwitched(networkName))

          posthog?.capture('Changed network', { network_name: networkName })
          return
        }
      }
    },
    [dispatch, network.name]
  )

  return (
    <>
      <Select
        options={networkSelectOptions}
        onSelect={handleNetworkPresetChange}
        controlledValue={networkSelectOptions.find((n) => n.value === network.name)}
        title={t('Current network')}
        id="network"
        noMargin
        renderCustomComponent={SelectCustomComponent}
        skipEqualityCheck
        ListBottomComponent={
          <MoreOptionsItem onClick={() => setIsSettingsModalOpen(true)}>
            {t('More options')} <ArrowRight size={16} />
          </MoreOptionsItem>
        }
      />
      <ModalPortal>
        {isSettingsModalOpen && (
          <SettingsModal onClose={() => setIsSettingsModalOpen(false)} initialTabValue="network" />
        )}
      </ModalPortal>
    </>
  )
}

export default NetworkSwitch

const SelectCustomComponent = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const network = useAppSelector((state) => state.network)

  const networkStatusColor = {
    online: theme.global.valid,
    offline: theme.global.alert,
    connecting: theme.global.accent,
    uninitialized: theme.font.tertiary
  }[network.status]

  return (
    <Button role="secondary" transparent short data-tooltip-id="default" data-tooltip-content={t('Current network')}>
      <NetworkNameLabel>{upperFirst(network.name)}</NetworkNameLabel>
      <DotIcon color={networkStatusColor} />
    </Button>
  )
}

const NetworkNameLabel = styled.span`
  margin-right: 10px;
`

const MoreOptionsItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  gap: 10px;
  color: ${({ theme }) => theme.font.secondary};

  &:hover {
    cursor: pointer;
    color: ${({ theme }) => theme.font.primary};
  }
`
