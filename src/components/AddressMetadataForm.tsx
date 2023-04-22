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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import ColoredLabelInput, { ColoredLabelInputValue } from '@/components/Inputs/ColoredLabelInput'
import InlineLabelValueInput from '@/components/Inputs/InlineLabelValueInput'
import Toggle from '@/components/Inputs/Toggle'
import { ReactComponent as MainAddressBadge } from '@/images/main_address_badge.svg'

interface AddressMetadataFormProps {
  label: ColoredLabelInputValue
  setLabel: (label: ColoredLabelInputValue) => void
  defaultAddressMessage: string
  isDefault: boolean
  setIsDefault: (isDefault: boolean) => void
  isDefaultAddressToggleEnabled: boolean
  singleAddress?: boolean
}

const AddressMetadataForm = ({
  label,
  setLabel,
  defaultAddressMessage,
  singleAddress,
  isDefault,
  setIsDefault,
  isDefaultAddressToggleEnabled
}: AddressMetadataFormProps) => {
  const { t } = useTranslation()

  return (
    <>
      <ColoredLabelInput label={t`Address label`} onChange={setLabel} value={label} id="label" maxLength={50} />
      {singleAddress && (
        <>
          <HorizontalDivider narrow />
          <InlineLabelValueInput
            label={
              <Label>
                <StyledMainAddressBadge width={11} /> {t`Default address`}
              </Label>
            }
            description={defaultAddressMessage}
            InputComponent={
              <Toggle
                toggled={isDefault}
                label={t`Make this your default address`}
                onToggle={() => setIsDefault(!isDefault)}
                disabled={!isDefaultAddressToggleEnabled}
              />
            }
          />
        </>
      )}
    </>
  )
}

export default AddressMetadataForm

const Label = styled.div`
  display: flex;
  align-items: center;
`

const StyledMainAddressBadge = styled(MainAddressBadge)`
  width: 11px;
  margin-right: var(--spacing-1);
`
