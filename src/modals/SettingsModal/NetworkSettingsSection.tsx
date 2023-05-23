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

import { AlertCircle } from 'lucide-react'
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
import { defaultProxySettings, networkPresets } from '@/storage/settings/settingsPersistentStorage'
import { NetworkName, NetworkNames } from '@/types/network'
import { NetworkSettings, ProxySettings } from '@/types/settings'
import { AlephiumWindow } from '@/types/window'
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

  const _window = window as unknown as AlephiumWindow
  const electron = _window.electron

  const proxySettings = electron?.app.getProxySettings()

  const [tempNetworkSettings, setTempNetworkSettings] = useState<NetworkSettings>(network.settings)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkName>()

  const [tempProxySettings, setTempProxySettings] = useState<ProxySettings>(proxySettings || defaultProxySettings)

  const [advancedSectionOpen, setAdvancedSectionOpen] = useState(false)

  const overrideSelectionIfMatchesPreset = useCallback((newSettings: NetworkSettings) => {
    // Check if values correspond to an existing preset
    const newNetwork = getNetworkName(newSettings)

    setSelectedNetwork(newNetwork)
  }, [])

  const editNetworkSettings = (v: Partial<NetworkSettings>) => {
    const newSettings = { ...tempNetworkSettings, ...v }

    // Check if we need to append the http:// protocol if an IP or localhost is used
    if (v.nodeHost?.match(/^(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|localhost)(?::[0-9]*)?$/)) {
      newSettings.nodeHost = `http://${v.nodeHost}`
    }

    overrideSelectionIfMatchesPreset(newSettings)

    setTempNetworkSettings(newSettings)
  }

  const editProxySettings = (v: Partial<ProxySettings>) => {
    console.log(v)
    console.log(tempProxySettings)
    setTempProxySettings((p) => ({ ...p, ...v }))
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
          setTempNetworkSettings(newNetworkSettings)

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
          setTempNetworkSettings(settings)

          posthog?.capture('Saved custom network settings')
        }
      }
    },
    [dispatch, posthog, selectedNetwork]
  )

  const handleAdvancedSettingsSave = useCallback(() => {
    if (
      selectedNetwork !== 'custom' &&
      (selectedNetwork === network.name || getNetworkName(tempNetworkSettings) === network.name)
    ) {
      setAdvancedSectionOpen(false)
      setSelectedNetwork(network.name)
      return
    }

    overrideSelectionIfMatchesPreset(tempNetworkSettings)
    dispatch(customNetworkSettingsSaved(tempNetworkSettings))

    // Proxy settings
    electron?.app.setProxySettings(tempProxySettings.address, tempProxySettings.port)

    posthog?.capture('Saved custom network settings')
  }, [
    dispatch,
    electron?.app,
    network.name,
    overrideSelectionIfMatchesPreset,
    posthog,
    selectedNetwork,
    tempNetworkSettings,
    tempProxySettings.address,
    tempProxySettings.port
  ])

  // Set existing value on mount
  useMountEffect(() => {
    overrideSelectionIfMatchesPreset(network.settings)
  })

  return (
    <>
      <StyledInfoBox
        Icon={AlertCircle}
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
          <h2 tabIndex={0} role="label">
            {t("Alephium's services")}
          </h2>
          <Input
            id="node-host"
            label={t`Node host`}
            value={tempNetworkSettings.nodeHost}
            onChange={(e) => editNetworkSettings({ nodeHost: e.target.value })}
          />
          <Input
            id="explorer-api-host"
            label={t`Explorer API host`}
            value={tempNetworkSettings.explorerApiHost}
            onChange={(e) => editNetworkSettings({ explorerApiHost: e.target.value })}
          />
          <Input
            id="explorer-url"
            label={t`Explorer URL`}
            value={tempNetworkSettings.explorerUrl}
            onChange={(e) => editNetworkSettings({ explorerUrl: e.target.value })}
          />
          <h2 tabIndex={0} role="label">
            {t('Custom proxy')}
          </h2>
          <Input
            id="proxy-address"
            label={t`Proxy address`}
            value={tempProxySettings.address}
            onChange={(e) => editProxySettings({ address: e.target.value })}
          />
          <Input
            id="proxy-port"
            label={t`Proxy port`}
            value={tempProxySettings.port}
            onChange={(e) => editProxySettings({ port: e.target.value })}
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
