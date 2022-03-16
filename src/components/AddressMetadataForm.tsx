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

import ColoredLabelInput, { ColoredLabelInputValue } from './Inputs/ColoredLabelInput'
import InlineLabelValueInput from './Inputs/InlineLabelValueInput'
import Toggle from './Inputs/Toggle'
import HorizontalDivider from './PageComponents/HorizontalDivider'

interface AddressMetadataFormProps {
  label: ColoredLabelInputValue
  setLabel: (label: ColoredLabelInputValue) => void
  mainAddressMessage: string
  isMain: boolean
  setIsMain: (isMain: boolean) => void
  isMainAddressToggleEnabled: boolean
  singleAddress?: boolean
}

const AddressMetadataForm = ({
  label,
  setLabel,
  mainAddressMessage,
  singleAddress,
  isMain,
  setIsMain,
  isMainAddressToggleEnabled
}: AddressMetadataFormProps) => (
  <>
    <ColoredLabelInput placeholder="Address label" onChange={setLabel} value={label} id="label" maxLength={50} />
    {singleAddress && (
      <>
        <HorizontalDivider narrow />
        <InlineLabelValueInput
          label="★ Main address"
          description={mainAddressMessage}
          InputComponent={
            <Toggle toggled={isMain} onToggle={() => setIsMain(!isMain)} disabled={!isMainAddressToggleEnabled} />
          }
        />
      </>
    )}
  </>
)

export default AddressMetadataForm
