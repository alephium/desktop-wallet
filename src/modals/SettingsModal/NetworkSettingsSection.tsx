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

import { AlertTriangle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import ExpandableSection from '@/components/ExpandableSection'
import InfoBox from '@/components/InfoBox'
import Input from '@/components/Inputs/Input'
import Select from '@/components/Inputs/Select'
import { Section } from '@/components/PageComponents/PageContainers'
import { useGlobalContext } from '@/contexts/global'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import i18next from '@/i18n'
import { networkPresets } from '@/persistent-storage/settings'
import { customNetworkSettingsSaved, networkPresetSwitched } from '@/store/networkSlice'
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
  const { settings: currentSettings } = useAppSelector((state) => state.network)
  const { client, setSnackbarMessage } = useGlobalContext()

  const [tempAdvancedSettings, setTempAdvancedSettings] = useState<NetworkSettings>(currentSettings)
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
    async (option: typeof networkSelectOptions[number] | undefined) => {
      if (option && option.value !== selectedNetwork) {
        setSelectedNetwork(option.value)

        if (option.value === 'custom') {
          setAdvancedSectionOpen(true)
          return
        }

        const newNetworkSettings = networkPresets[option.value]

        let networkId = newNetworkSettings.networkId

        if (networkId !== undefined) {
          dispatch(networkPresetSwitched(option.value))
          setTempAdvancedSettings(newNetworkSettings)
          return
        }

        if (networkId === undefined && client !== undefined) {
          const response = await client.web3.infos.getInfosChainParams()
          networkId = response.networkId
        }

        if (networkId !== undefined) {
          const settings = { ...newNetworkSettings, networkId: networkId }
          dispatch(customNetworkSettingsSaved(settings))
          setTempAdvancedSettings(settings)
        }
      }
    },
    [client, dispatch, selectedNetwork]
  )

  const handleAdvancedSettingsSave = useCallback(() => {
    overrideSelectionIfMatchesPreset(tempAdvancedSettings)
    dispatch(customNetworkSettingsSaved(tempAdvancedSettings))
    setSnackbarMessage({ text: t`Custom network settings saved.`, type: 'info' })
  }, [dispatch, overrideSelectionIfMatchesPreset, setSnackbarMessage, t, tempAdvancedSettings])

  // Set existing value on mount
  useMountEffect(() => {
    overrideSelectionIfMatchesPreset(currentSettings)
  })

  return (
    <>
      <InfoBox
        Icon={AlertTriangle}
        text={t`Make sure to always check what is the selected network before sending transactions.`}
      />
      <Select
        options={networkSelectOptions}
        onValueChange={handleNetworkPresetChange}
        controlledValue={networkSelectOptions.find((n) => n.value === selectedNetwork)}
        title={t`Network`}
        label={t`Current network`}
        id="network"
      />
      <ExpandableSection
        sectionTitleClosed={t`Advanced settings`}
        open={advancedSectionOpen}
        onOpenChange={(isOpen) => setAdvancedSectionOpen(isOpen)}
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
      </ExpandableSection>
    </>
  )
}

const UrlInputs = styled.div`
  display: flex;
  flex-direction: column;
`

export default NetworkSettingsSection
