// Copyright 2018 - 2021 The Alephium Authors
// This file is part of the alephium project.
//
// The library is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// The library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with the library. If not, see <http://www.gnu.org/licenses/>.

import { AlertTriangle } from 'lucide-react'
import { useContext, useState, useCallback } from 'react'
import styled from 'styled-components'

import { GlobalContext } from '../../App'
import { Button } from '../../components/Buttons'
import ExpandableSection from '../../components/ExpandableSection'
import InfoBox from '../../components/InfoBox'
import { Input } from '../../components/Inputs/Input'
import { Select } from '../../components/Inputs/Select'
import { Section } from '../../components/PageComponents/PageContainers'
import { useMountEffect } from '../../utils/hooks'
import { NetworkType, getNetworkName, networkEndpoints, Settings } from '../../utils/settings'

interface NetworkSelectOption {
  label: string
  value: NetworkType
}

type NetworkSettings = Settings['network']

const NetworkSettingsSection = () => {
  const { settings: currentSettings, updateSettings, setSnackbarMessage } = useContext(GlobalContext)
  const [tempAdvancedSettings, setTempAdvancedSettings] = useState<NetworkSettings>(currentSettings.network)
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkType>()
  const [advancedSectionOpen, setAdvancedSectionOpen] = useState(false)

  const networkSelectOptions: NetworkSelectOption[] = [
    { label: 'Mainnet', value: 'mainnet' },
    { label: 'Testnet', value: 'testnet' },
    { label: 'Localhost', value: 'localhost' },
    { label: 'Custom', value: 'custom' }
  ]

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
          updateSettings('network', newNetworkSettings)
          setTempAdvancedSettings(newNetworkSettings)
        }
      }
    },
    [selectedNetwork, updateSettings]
  )

  const handleAdvancedSettingsSave = useCallback(() => {
    overrideSelectionIfMatchesPreset(tempAdvancedSettings)
    updateSettings('network', tempAdvancedSettings)
    setSnackbarMessage({ text: 'Custom network settings saved.', type: 'info' })
  }, [overrideSelectionIfMatchesPreset, updateSettings, setSnackbarMessage, tempAdvancedSettings])

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
        placeholder="Current network"
        id="network"
      />
      <ExpandableSection
        sectionTitle="Advanced settings"
        open={advancedSectionOpen}
        onOpenChange={(isOpen) => setAdvancedSectionOpen(isOpen)}
      >
        <UrlInputs>
          <Input
            placeholder="Node host"
            value={tempAdvancedSettings.nodeHost}
            onChange={(e) => editAdvancedSettings({ nodeHost: e.target.value })}
          />
          <Input
            placeholder="Explorer API host"
            value={tempAdvancedSettings.explorerApiHost}
            onChange={(e) => editAdvancedSettings({ explorerApiHost: e.target.value })}
          />
          <Input
            placeholder="Explorer URL"
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
