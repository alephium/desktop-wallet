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

interface InfoRowProps {
  label: string
  className?: string
}

const InfoRow: FC<InfoRowProps> = ({ label, className, children }) => (
  <div className={className}>
    <Label>{label}</Label>
    <div>{children}</div>
  </div>
)

export default styled(InfoRow)`
  display: flex;
  justify-content: space-between;
  padding: 18px 15px;
`

const Label = styled.div`
  font-weight: var(--fontWeight-semiBold);
  color: ${({ theme }) => theme.font.secondary};
`
