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

// TODO: Extract to common shared UI library

import { QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

interface QRCodeButtonProps {
  textToEncode: string
  className?: string
}

const QRCodeButton = ({ textToEncode, className }: QRCodeButtonProps) => {
  const qrCodeId = `qr-${textToEncode}`

  return (
    <>
      <QRCodeIcon className={className} data-tip data-for={qrCodeId} data-event="click" size={15} />
      <Tooltip id={qrCodeId} backgroundColor="black" globalEventOff="click" place="right">
        <QRCode size={150} value={textToEncode} bgColor="black" fgColor="white" />
      </Tooltip>
    </>
  )
}

const QRCodeIcon = styled(QrCode)`
  cursor: pointer;
  color: ${({ theme }) => theme.font.secondary};
`

const Tooltip = styled(ReactTooltip)`
  opacity: 1 !important;
`

export default QRCodeButton
