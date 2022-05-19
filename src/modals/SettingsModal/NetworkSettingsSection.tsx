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

import { capitalize } from 'lodash'
import { AlertTriangle } from 'lucide-react'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import Button from '../../components/Button'
import ExpandableSection from '../../components/ExpandableSection'
import InfoBox from '../../components/InfoBox'
import Input from '../../components/Inputs/Input'
import Select from '../../components/Inputs/Select'
import { Section } from '../../components/PageComponents/PageContainers'
import { useGlobalContext } from '../../contexts/global'
import { useMountEffect } from '../../utils/hooks'
import { getNetworkName, networkEndpoints, NetworkType, networkTypes, Settings } from '../../utils/settings'

interface NetworkSelectOption {
  label: string
  value: NetworkType
}

type NetworkSettings = Settings['network']

const NetworkSettingsSection = () => {
  const { settings: currentSettings, updateNetworkSettings, setSnackbarMessage } = useGlobalContext()
  const [tempAdvancedSettings, setTempAdvancedSettings] = useState<NetworkSettings>(currentSettings.network)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>()
  const [advancedSectionOpen, setAdvancedSectionOpen] = useState(false)

  const networkSelectOptions: NetworkSelectOption[] = networkTypes.map((networkType) => ({
    label: capitalize(networkType),
    value: networkType
  }))

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
    (option: typeof networkSelectOptions[number] | undefined) => {
      if (option && option.value !== selectedNetwork) {
        setSelectedNetwork(option.value)

        if (option.value === 'custom') {
          // Make sure to open expandable advanced section
          setAdvancedSectionOpen(true)
        } else {
          const newNetworkSettings = networkEndpoints[option.value]
          updateNetworkSettings(newNetworkSettings)
          setTempAdvancedSettings(newNetworkSettings)
        }
      }
    },
    [selectedNetwork, updateNetworkSettings]
  )

  const handleAdvancedSettingsSave = useCallback(() => {
    overrideSelectionIfMatchesPreset(tempAdvancedSettings)
    updateNetworkSettings(tempAdvancedSettings)
    setSnackbarMessage({ text: 'Custom network settings saved.', type: 'info' })
  }, [overrideSelectionIfMatchesPreset, updateNetworkSettings, setSnackbarMessage, tempAdvancedSettings])

  // Set existing value on mount
  useMountEffect(() => {
    overrideSelectionIfMatchesPreset(currentSettings.network)
  })

  return (
    <>
      <InfoBox
        Icon={AlertTriangle}
        text="Make sure to always check what is the selected network before sending transactions."
      />
      <Select
        options={networkSelectOptions}
        onValueChange={handleNetworkPresetChange}
        controlledValue={networkSelectOptions.find((n) => n.value === selectedNetwork)}
        title="Network"
        label="Current network"
        id="network"
      />
      <ExpandableSection
        sectionTitleClosed="Advanced settings"
        open={advancedSectionOpen}
        onOpenChange={(isOpen) => setAdvancedSectionOpen(isOpen)}
      >
        <UrlInputs>
          <Input
            label="Node host"
            value={tempAdvancedSettings.nodeHost}
            onChange={(e) => editAdvancedSettings({ nodeHost: e.target.value })}
          />
          <Input
            label="Explorer API host"
            value={tempAdvancedSettings.explorerApiHost}
            onChange={(e) => editAdvancedSettings({ explorerApiHost: e.target.value })}
          />
          <Input
            label="Explorer URL"
            value={tempAdvancedSettings.explorerUrl}
            onChange={(e) => editAdvancedSettings({ explorerUrl: e.target.value })}
          />
        </UrlInputs>
        <Section inList>
          <Button onClick={handleAdvancedSettingsSave}>Save</Button>
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
