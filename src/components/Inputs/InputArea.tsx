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

import { motion, MotionProps } from 'framer-motion'
import { KeyboardEventHandler, MouseEventHandler, MutableRefObject, ReactNode } from 'react'
import styled from 'styled-components'

interface InputAreaProps extends MotionProps {
  children: ReactNode | ReactNode[]
  onKeyDown?: KeyboardEventHandler
  onInput?: () => void
  onMouseDown?: MouseEventHandler
  className?: string
  innerRef?: MutableRefObject<HTMLDivElement>
}

const InputArea = ({ onKeyDown, onInput, children, className, onMouseDown, ...rest }: InputAreaProps) => (
  <motion.div
    role="button"
    tabIndex={0}
    onMouseDown={onMouseDown}
    onInput={onInput}
    onKeyDown={onKeyDown}
    className={className}
    {...rest}
  >
    {children}
  </motion.div>
)

export default styled(InputArea)`
  position: relative;
  height: var(--inputHeight);
  width: 100%;
  cursor: pointer;
`
