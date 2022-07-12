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
import { useTranslation } from 'react-i18next'
import ReactTooltip from 'react-tooltip'
import styled from 'styled-components'

import { useGlobalContext } from '../../contexts/global'

interface ClipboardButtonProps {
  textToCopy: string
  className?: string
}

const ClipboardButton = ({ textToCopy, className }: ClipboardButtonProps) => {
  const { t } = useTranslation('App')
  const [hasBeenCopied, setHasBeenCopied] = useState(false)
  const { setSnackbarMessage } = useGlobalContext()

  const handleInput = () => {
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
    let interval: ReturnType<typeof setInterval>
    // Reset icon after copy
    if (hasBeenCopied) {
      setSnackbarMessage({ text: t`Copied to clipboard!`, type: 'info' })

      interval = setInterval(() => {
        setHasBeenCopied(false)
      }, 3000)
    }

    ReactTooltip.rebuild()

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [hasBeenCopied, setSnackbarMessage, textToCopy, className, t])

  if (!hasBeenCopied) {
    return (
      <div data-tip={t`Copy to clipboard`}>
        <Clipboard
          className={`${className} clipboard`}
          size={15}
          onClick={handleInput}
          onKeyPress={handleInput}
          role="button"
          tabIndex={0}
        />
      </div>
    )
  } else {
    return (
      <div data-tip={t`Copied`}>
        <Check className={`${className} check`} size={15} />
      </div>
    )
  }
}

export default styled(ClipboardButton)`
  &.clipboard {
    cursor: pointer;
    color: ${({ theme }) => theme.font.secondary};
  }

  &.check {
    color: ${({ theme }) => theme.font.primary};
  }
`
