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

import { AlertOctagon } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import client from '@/api/client'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import { Section } from '@/components/PageComponents/PageContainers'
import ToggleSection from '@/components/ToggleSection'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import i18next from '@/i18n'
import { customNetworkSettingsSaved, networkPresetSwitched } from '@/storage/settings/networkActions'
import { networkPresets } from '@/storage/settings/settingsPersistentStorage'
import { NetworkName, NetworkNames } from '@/types/network'
import { NetworkSettings } from '@/types/settings'
import { useMountEffect } from '@/utils/hooks'
import { getNetworkName } from '@/utils/settings'

interface NetworkSelectOption {
  label: string
  value: NetworkName
}

const networkNames = Object.values(NetworkNames) as (keyof typeof NetworkNames)[]

const networkSelectOptions: NetworkSelectOption[] = networkNames.map((networkName) => ({
  label: {
    mainnet: i18next.t('Mainnet'),
    testnet: i18next.t('Testnet'),
    localhost: i18next.t('Localhost'),
    custom: i18next.t('Custom')
  }[networkName],
  value: networkName
}))

const NetworkSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const network = useAppSelector((state) => state.network)
  const posthog = usePostHog()

  const [tempAdvancedSettings, setTempAdvancedSettings] = useState<NetworkSettings>(network.settings)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkName>()
  const [advancedSectionOpen, setAdvancedSectionOpen] = useState(false)

  const overrideSelectionIfMatchesPreset = useCallback((newSettings: NetworkSettings) => {
    // Check if values correspond to an existing preset
    const newNetwork = getNetworkName(newSettings)

    setSelectedNetwork(newNetwork)
  }, [])

  const editAdvancedSettings = (v: Partial<NetworkSettings>) => {
    const newSettings = { ...tempAdvancedSettings, ...v }

    // Check if we need to append the http:// protocol if an IP or localhost is used
    if (v.nodeHost?.match(/^(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|localhost)(?::[0-9]*)?$/)) {
      newSettings.nodeHost = `http://${v.nodeHost}`
    }

    overrideSelectionIfMatchesPreset(newSettings)

    setTempAdvancedSettings(newSettings)
  }

  const handleNetworkPresetChange = useCallback(
    async (networkName: NetworkName) => {
      if (networkName !== selectedNetwork) {
        setSelectedNetwork(networkName)

        if (networkName === 'custom') {
          setAdvancedSectionOpen(true)
          return
        }

        setAdvancedSectionOpen(false)

        const newNetworkSettings = networkPresets[networkName]

        let networkId = newNetworkSettings.networkId

        if (networkId !== undefined) {
          dispatch(networkPresetSwitched(networkName))
          setTempAdvancedSettings(newNetworkSettings)

          posthog?.capture('Changed network', { network_name: networkName })
          return
        }

        if (networkId === undefined) {
          const response = await client.node.infos.getInfosChainParams()
          networkId = response.networkId
        }

        if (networkId !== undefined) {
          const settings = { ...newNetworkSettings, networkId: networkId }
          dispatch(customNetworkSettingsSaved(settings))
          setTempAdvancedSettings(settings)

          posthog?.capture('Saved custom network settings')
        }
      }
    },
    [dispatch, posthog, selectedNetwork]
  )

  const handleAdvancedSettingsSave = useCallback(() => {
    if (
      selectedNetwork !== 'custom' &&
      (selectedNetwork === network.name || getNetworkName(tempAdvancedSettings) === network.name)
    ) {
      setAdvancedSectionOpen(false)
      setSelectedNetwork(network.name)
      return
    }

    overrideSelectionIfMatchesPreset(tempAdvancedSettings)
    dispatch(customNetworkSettingsSaved(tempAdvancedSettings))

    posthog?.capture('Saved custom network settings')
  }, [dispatch, network.name, overrideSelectionIfMatchesPreset, posthog, selectedNetwork, tempAdvancedSettings])

  // Set existing value on mount
  useMountEffect(() => {
    overrideSelectionIfMatchesPreset(network.settings)
  })

  return (
    <>
      <StyledInfoBox
        Icon={AlertOctagon}
        text={t`Make sure to always check what is the selected network before sending transactions.`}
        importance="accent"
      />
      <Select
        options={networkSelectOptions}
        onSelect={handleNetworkPresetChange}
        controlledValue={networkSelectOptions.find((n) => n.value === selectedNetwork)}
        title={t`Network`}
        label={t`Current network`}
        id="network"
      />
      <ToggleSection
        title={t('Advanced settings')}
        subtitle={t('Set custom network URLs')}
        isOpen={advancedSectionOpen}
        onClick={(isOpen) => setAdvancedSectionOpen(isOpen)}
      >
        <UrlInputs>
          <Input
            id="node-host"
            label={t`Node host`}
            value={tempAdvancedSettings.nodeHost}
            onChange={(e) => editAdvancedSettings({ nodeHost: e.target.value })}
          />
          <Input
            id="explorer-api-host"
            label={t`Explorer API host`}
            value={tempAdvancedSettings.explorerApiHost}
            onChange={(e) => editAdvancedSettings({ explorerApiHost: e.target.value })}
          />
          <Input
            id="explorer-url"
            label={t`Explorer URL`}
            value={tempAdvancedSettings.explorerUrl}
            onChange={(e) => editAdvancedSettings({ explorerUrl: e.target.value })}
          />
        </UrlInputs>
        <Section inList>
          <Button onClick={handleAdvancedSettingsSave}>{t`Save`}</Button>
        </Section>
      </ToggleSection>
    </>
  )
}

const UrlInputs = styled.div`
  display: flex;
  flex-direction: column;
`

const StyledInfoBox = styled(InfoBox)`
  margin-top: 0;
`

export default NetworkSettingsSection
