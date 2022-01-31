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

import { Check, Clipboard } from 'lucide-react'
import { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useGlobalContext } from '../../contexts/global'

const ClipboardButton = ({ textToCopy }: { textToCopy: string }) => {
  const [hasBeenCopied, setHasBeenCopied] = useState(false)
  const { setSnackbarMessage } = useGlobalContext()

  const handleClick = () => {
    navigator.clipboard
      .writeText(textToCopy)
      .catch((e) => {
        throw e
      })
      .then(() => {
        setHasBeenCopied(true)
      })
  }

  useEffect(() => {
    // Reset icon after copy
    if (hasBeenCopied) {
      ReactTooltip.rebuild()
      setSnackbarMessage({ text: 'Copied to clipboard!', type: 'info' })

      setInterval(() => {
        setHasBeenCopied(false)
      }, 3000)
    }
  }, [hasBeenCopied, setSnackbarMessage])

  if (!hasBeenCopied) {
    return <StyledClipboardIcon size={15} data-tip={'Copy to clipboard'} onClick={handleClick} />
  } else {
    return <StyledCheckIcon size={15} />
  }
}

const StyledClipboardIcon = styled(Clipboard)`
  margin-left: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.font.secondary};
`

const StyledCheckIcon = styled(Check)`
  margin-left: 10px;
  color: ${({ theme }) => theme.font.primary};
`

export default ClipboardButton
