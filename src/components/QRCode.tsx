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

import { CopyIcon } from 'lucide-react'
import { useCallback } from 'react'
import RawQRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import Box from '@/components/Box'
import Button from '@/components/Button'
import { useAppDispatch } from '@/hooks/redux'
import { copiedToClipboard, copyToClipboardFailed } from '@/storage/global/globalActions'

interface QRCodeProps {
  value: string
  size: number
  copyButtonLabel?: string
  className?: string
}

const QRCode = ({ value, size, copyButtonLabel, className }: QRCodeProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()

  const handleCopyAddressToClipboard = useCallback(() => {
    if (!value) {
      dispatch(copyToClipboardFailed())
    } else {
      navigator.clipboard
        .writeText(value)
        .catch((e) => {
          throw e
        })
        .then(() => {
          dispatch(copiedToClipboard())
        })
    }
  }, [dispatch, value])

  return (
    <div className={className}>
      <StyledBox size={size}>
        <RawQRCode size={size} value={value} bgColor={theme.bg.primary} fgColor={theme.font.primary} />
      </StyledBox>
      {copyButtonLabel && (
        <Button role="secondary" Icon={CopyIcon} onClick={handleCopyAddressToClipboard}>
          {copyButtonLabel}
        </Button>
      )}
    </div>
  )
}

export default styled(QRCode)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

const StyledBox = styled(Box)<{ size: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size + 25}px;
  height: ${({ size }) => size + 25}px;
`
