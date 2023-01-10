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

import styled from 'styled-components'

import Spinner from './Spinner'

interface AppSpinnerProps {
  className?: string
}

const AppSpinner = ({ className }: AppSpinnerProps) => (
  <div className={className}>
    <Spinner size="60px" />
  </div>
)

export default styled(AppSpinner)`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--color-black);
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
`
