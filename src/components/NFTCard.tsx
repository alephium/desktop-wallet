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

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState } from 'react'
import styled from 'styled-components'

import Card3D, { card3DHoverTransition } from '@/components/Card3D'
import Truncate from '@/components/Truncate'
import { NFT } from '@/types/assets'

interface NFTCardProps {
  nft: NFT
}

// TODO: Copied from explorer

const NFTCard = ({ nft }: NFTCardProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const y = useMotionValue(0.5)
  const x = useMotionValue(0.5)

  const springConfig = { damping: 10, stiffness: 100 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const imagePosX = useTransform(xSpring, [0, 1], ['5px', '-5px'], {
    clamp: true
  })
  const imagePosY = useTransform(ySpring, [0, 1], ['5px', '-5px'], {
    clamp: true
  })

  const handlePointerMove = (pointerX: number, pointerY: number) => {
    x.set(pointerX, true)
    y.set(pointerY, true)
  }

  return (
    <NFTCardStyled
      onPointerMove={handlePointerMove}
      onCardHover={setIsHovered}
      frontFace={
        <FrontFace>
          <NFTPictureContainer>
            <PictureContainerShadow animate={{ opacity: isHovered ? 1 : 0 }} />
            <NFTPicture
              style={{
                backgroundImage: `url(${nft?.image})`,
                x: imagePosX,
                y: imagePosY,
                scale: 1.5
              }}
              animate={{
                scale: isHovered ? 1 : 1.5
              }}
              transition={card3DHoverTransition}
            />
          </NFTPictureContainer>
          <NFTName>{nft?.name}</NFTName>
        </FrontFace>
      }
      backFace={
        <BackFace>
          <BackFaceBackground style={{ backgroundImage: `url(${nft?.image})` }} />
          <NFTDescription>{nft?.description}</NFTDescription>
        </BackFace>
      }
    />
  )
}

export default NFTCard

const NFTCardStyled = styled(Card3D)`
  background-color: ${({ theme }) => theme.bg.primary};
`

const FrontFace = styled.div`
  padding: 10px;
`

const BackFace = styled.div`
  padding: 20px;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.background2};
  border-radius: 9px;
  position: relative;
`

const NFTPictureContainer = styled(motion.div)`
  position: relative;
  border-radius: 9px;
  overflow: hidden;
`

const PictureContainerShadow = styled(motion.div)`
  position: absolute;
  height: 100%;
  width: 100%;
  box-shadow: inset 0 0 30px black;
  z-index: 2;
`

const NFTPicture = styled(motion.div)`
  max-width: 100%;
  height: 150px;
  background-repeat: no-repeat;
  background-color: black;
  background-size: contain;
  background-position: center;
`

const NFTName = styled(Truncate)`
  margin-top: 15px;
  font-weight: 600;
  margin: 15px 0;
  max-width: 100%;
`

const NFTDescription = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 10;
  -webkit-box-orient: vertical;
  overflow: hidden;
  position: relative;
`

const BackFaceBackground = styled.div`
  position: absolute;
  background-size: cover;
  background-repeat: no-repeat;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  border-radius: 9px;
  opacity: 0.3;
`
