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

import styled from 'styled-components'

interface SkeletonLoaderProps {
  height?: string
  width?: string
  className?: string
}

const SkeletonLoader = ({ className }: SkeletonLoaderProps) => (
  <div className={className}>
    <AnimatedBackground />
  </div>
)

export default styled(SkeletonLoader)`
  background-color: rgba(255, 255, 255, 0.05);
  width: ${({ width }) => width || '100%'};
  height: ${({ height }) => height || '20px'};
  border-radius: var(--radius-big);
  overflow: hidden;
`

const AnimatedBackground = styled.div`
  width: 100%;
  height: 100%;

  background-image: linear-gradient(-90deg, rgba(0, 0, 0, 0.05), rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.05));
  background-size: 400% 400%;
  animation: gradientAnimation 1.5s ease-in-out infinite;

  @keyframes gradientAnimation {
    0% {
      background-position: 0% 0%;
    }
    100% {
      background-position: -135% 0%;
    }
  }
`
