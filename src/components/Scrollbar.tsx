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

// Used as reference: https://github.com/xobotyi/react-scrollbars-custom/issues/46#issuecomment-897506147

import React, { CSSProperties, useState } from 'react'
import Scrollbar, { ScrollbarProps } from 'react-scrollbars-custom'
import { ElementPropsWithElementRef } from 'react-scrollbars-custom/dist/types/types'
import { useTheme } from 'styled-components'

const paddingRight = '6px'
const width = `calc(6px + ${paddingRight})`

const paddingTop = '6px'
const height = `calc(6px + ${paddingTop})`

const createScrollbarPiece = (regular: CSSProperties, additional?: CSSProperties, useAdditionalStyling?: boolean) => ({
  renderer: ({ elementRef, style, ...restProps }: ElementPropsWithElementRef) => (
    <div {...restProps} ref={elementRef} style={{ ...style, ...regular, ...(useAdditionalStyling && additional) }} />
  )
})

interface ScrollbarCustomProps extends ScrollbarProps {
  // When children have dynamic sizes, set this to true (like the AddressSummaryCards in OverviewPage/Header).
  isDynamic?: boolean
}

const ScrollbarCustom = (props: ScrollbarCustomProps) => {
  const theme = useTheme()
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMouseOver, setIsMouseOver] = useState(false)
  const isShow = isScrolling || isMouseOver

  const onScrollStart = () => setIsScrolling(true)
  const onScrollStop = () => setIsScrolling(false)
  const onMouseEnter = () => setIsMouseOver(true)
  const onMouseLeave = () => setIsMouseOver(false)

  const { isDynamic } = props

  const transparencyStyle = {
    backgroundColor: 'transparent',
    opacity: isShow ? 1 : 0,
    transition: 'opacity 0.4s ease-in-out'
  }

  const trackXProps = createScrollbarPiece({ height, paddingTop }, transparencyStyle, true)
  const trackYProps = createScrollbarPiece({ width, paddingRight }, transparencyStyle, true)
  const thumbProps = createScrollbarPiece({ backgroundColor: theme.font.tertiary })

  const rendererProps = createScrollbarPiece(
    {},
    { position: 'relative' as const, width: 'unset', height: 'unset', overflow: 'hidden' },
    isDynamic
  ).renderer

  const wrapperProps = createScrollbarPiece(
    { right: 0 },
    { position: 'relative' as const, height: '100%', top: '-15px' },
    isDynamic
  )

  const scrollerProps = createScrollbarPiece(
    {},
    { position: 'relative' as const, height: '100%', top: '15px' },
    isDynamic
  )

  const contentProps = createScrollbarPiece(
    { display: 'block' },
    { position: 'unset' as const, height: '100%' },
    isDynamic
  )

  // react-scrollbars-custom has a type issue where you can't just spread props
  // onto the component. That's why needed props are added as necessary.
  return (
    <Scrollbar
      renderer={rendererProps}
      wrapperProps={wrapperProps}
      contentProps={contentProps}
      scrollerProps={scrollerProps}
      trackXProps={trackXProps}
      trackYProps={trackYProps}
      thumbXProps={thumbProps}
      thumbYProps={thumbProps}
      onScrollStart={onScrollStart}
      onScrollStop={onScrollStop}
      scrollDetectionThreshold={500} // ms
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      momentum
      noScrollY={props.noScrollY}
      translateContentSizeYToHolder={props.translateContentSizeYToHolder}
    >
      {props.children}
    </Scrollbar>
  )
}

export default ScrollbarCustom
