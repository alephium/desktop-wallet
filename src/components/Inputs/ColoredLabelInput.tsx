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

import ColorPicker from '@/components/Inputs/ColorPicker'
import Input from '@/components/Inputs/Input'

export type ColoredLabelInputValue = {
  title: string
  color: string
}

interface ColoredLabelInputProps {
  value: ColoredLabelInputValue
  onChange: ({ title, color }: ColoredLabelInputValue) => void
  disabled?: boolean
  label?: string
  id?: string
  maxLength?: number
  className?: string
}

const ColoredLabelInput = ({ label, onChange, value, className, id, maxLength }: ColoredLabelInputProps) => {
  const [title, setTitle] = useState(value.title)
  const [color, setColor] = useState(value.color)

  useEffect(() => {
    onChange({ title, color })
  }, [title, color, onChange])

  return (
    <div className={className}>
      <Input
        label={label}
        autoComplete="off"
        onChange={(e) => setTitle(e.target.value)}
        value={title}
        id={id}
        color={color}
        maxLength={maxLength}
      />
      <ColorPicker onChange={setColor} value={color} />
    </div>
  )
}

export default styled(ColoredLabelInput)`
  display: flex;
  gap: 17px;
  width: 100%;
  align-items: center;
  position: relative;
`
