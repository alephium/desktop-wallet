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

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import tinycolor from 'tinycolor2'

import AddressBadge from '../AddressBadge'
import ColorPicker from './ColorPicker'
import Input from './Input'

export type ColoredLabelInputValue = {
  title: string
  color: string
}

interface ColoredLabelInputProps {
  value: ColoredLabelInputValue
  className?: string
  onChange: ({ title, color }: ColoredLabelInputValue) => void
  disabled?: boolean
  label?: string
  id?: string
  maxLength?: number
}

let ColoredLabelInput = ({ label, onChange, value, className, id, maxLength }: ColoredLabelInputProps) => {
  const [title, setTitle] = useState(value.title)
  const [color, setColor] = useState(value.color)
  const address = {
    isMain: false,
    color,
    label: title
  }

  useEffect(() => {
    onChange({ title, color })
  }, [title, color, onChange])

  return (
    <div className={className}>
      <InputStyled
        label={label}
        autoComplete="off"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
        id={id}
        color={color}
        maxLength={maxLength}
      />
      {title && <AddressBadgeStyled address={address} />}
      <ColorPicker onChange={setColor} value={color} />
    </div>
  )
}

ColoredLabelInput = styled(ColoredLabelInput)`
  display: flex;
  gap: 17px;
  width: 100%;
  align-items: center;
  position: relative;
`

const InputStyled = styled(Input)`
  color: transparent;
  caret-color: ${({ color, theme }) =>
    theme.name === 'dark' ? color : tinycolor(color).isLight() ? theme.font.primary : theme.font.contrastPrimary};

  &:not([value='']) {
    padding-left: calc(1rem + 0.2rem + 1em);
  }
`

const AddressBadgeStyled = styled(AddressBadge)`
  position: absolute;
  left: 12px;
`

export default ColoredLabelInput
