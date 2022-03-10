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

import { useRef } from 'react'
import styled from 'styled-components'

import useAnimationFrame from '../hooks/useAnimationFrame'

interface GradientCanvasProps {
  className?: string
}

const GradientCanvas = ({ className }: GradientCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  let t = 0

  useAnimationFrame((deltaTime) => {
    t = t + deltaTime * 0.001
    const $ = canvasRef.current?.getContext('2d')

    if (!$) return null

    const col = function (x: number, y: number, r: string | number, g: string | number, b: string | number) {
      $.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')'
      $.fillRect(x, y, 1, 1)
    }
    const R = function (x: number, y: number, t: number) {
      return Math.floor(192 + 64 * Math.cos((x * x - y * y) / 300 + t))
    }

    const G = function (x: number, y: number, t: number) {
      return Math.floor(192 + 64 * Math.sin((x * x * Math.cos(t / 4) + y * y * Math.sin(t / 3)) / 300))
    }

    const B = function (x: number, y: number, t: number) {
      return Math.floor(
        192 + 64 * Math.sin(5 * Math.sin(t / 9) + ((x - 100) * (x - 100) + (y - 100) * (y - 100)) / 1100)
      )
    }

    for (let x = 0; x <= 35; x++) {
      for (let y = 0; y <= 35; y++) {
        col(x, y, R(x, y, t), G(x, y, t), B(x, y, t))
      }
    }
  })

  return (
    <div className={className}>
      <canvas ref={canvasRef} height={32} width={32} />
    </div>
  )
}

export default styled(GradientCanvas)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 0;
  mix-blend-mode: soft-light;

  canvas {
    width: 100%;
    height: 100%;
  }
`
