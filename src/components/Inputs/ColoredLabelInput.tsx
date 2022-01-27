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

import Label from '../Label'
import ColorPicker from './ColorPicker'
import Input from './Input'

type ColoredLabelInputValue = {
  title: string
  color: string
}

interface ColoredLabelInputProps {
  value: ColoredLabelInputValue
  className?: string
  onChange: ({ title, color }: ColoredLabelInputValue) => void
  disabled?: boolean
  placeholder?: string
  id?: string
}

let ColoredLabelInput = ({ placeholder, disabled, onChange, value, className, id }: ColoredLabelInputProps) => {
  const [label, setLabel] = useState(value.title)
  const [color, setColor] = useState(value.color)

  useEffect(() => {
    onChange({ title: label, color })
  }, [label, color, onChange])

  return (
    <div className={className}>
      <InputStyled
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => setLabel(e.target.value)}
        value={label}
        id={id}
        color={color}
      />
      {label && <LabelStyled color={color}>{label}</LabelStyled>}
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
`

const LabelStyled = styled(Label)`
  position: absolute;
  left: 12px;
`

export default ColoredLabelInput
