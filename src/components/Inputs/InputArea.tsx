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

import { motion, MotionProps } from 'framer-motion'
import { ReactNode } from 'react'
import styled from 'styled-components'

interface InputAreaProps extends MotionProps {
  children: ReactNode | ReactNode[]
  onInput?: () => void
  className?: string
}

const InputArea = ({ onInput, children, className, ...rest }: InputAreaProps) => (
  <motion.div role="button" tabIndex={0} onClick={onInput} onKeyPress={onInput} className={className} {...rest}>
    {children}
  </motion.div>
)

export default styled(InputArea)`
  cursor: pointer;
`
