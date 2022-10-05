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

import { Check, Copy } from 'lucide-react'
import { ReactNode, SyntheticEvent, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useGlobalContext } from '../../contexts/global'

interface ClipboardButtonProps {
  textToCopy: string
  tipText?: string
  children?: ReactNode | ReactNode[]
  className?: string
}

const ClipboardButton = ({ tipText, textToCopy, children, className }: ClipboardButtonProps) => {
  const { t } = useTranslation('App')
  const [hasBeenCopied, setHasBeenCopied] = useState(false)
  const { setSnackbarMessage } = useGlobalContext()

  const handleInput = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation()

      navigator.clipboard
        .writeText(textToCopy)
        .catch((e) => {
          throw e
        })
        .then(() => {
          setHasBeenCopied(true)
        })
    },
    [setHasBeenCopied, textToCopy]
  )

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    // Reset icon after copy
    if (hasBeenCopied) {
      setSnackbarMessage({ text: t`Copied to clipboard!`, type: 'info' })

      interval = setInterval(() => {
        setHasBeenCopied(false)
      }, 3000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [hasBeenCopied, setSnackbarMessage, textToCopy, className, t])

  const clipboard = !hasBeenCopied ? (
    <ClipboardWrapper data-tip={tipText ?? t`Copy to clipboard`}>
      <Copy
        className={`${className} clipboard`}
        size={15}
        onClick={handleInput}
        onKeyPress={handleInput}
        role="button"
        aria-label={t`Copy to clipboard`}
        tabIndex={0}
      />
    </ClipboardWrapper>
  ) : (
    <ClipboardWrapper className={className} data-tip={t`Copied`}>
      <Check className={`${className} check`} size={15} />
    </ClipboardWrapper>
  )

  return children ? (
    <div className={className}>
      <CellChildren>{children}</CellChildren>
      <CellClipboard>{clipboard}</CellClipboard>
    </div>
  ) : (
    clipboard
  )
}

const CellClipboard = styled.div`
  opacity: 0;
  z-index: 1;
`

const CellChildren = styled.div`
  -webkit-mask-image: linear-gradient(to right, rgba(0, 0, 0, 1) 100%, rgba(0, 0, 0, 0));
  margin-right: -15px;
  overflow: hidden;
  width: 100%;
`

const ClipboardWrapper = styled.div`
  & > .clipboard {
    cursor: pointer;
    color: ${({ theme }) => theme.font.secondary};

    &:focus {
      outline: none;
    }

    &:focus-visible {
      outline: auto;
    }
  }

  &.check {
    color: ${({ theme }) => theme.font.primary};
  }
`

export default styled(ClipboardButton)`
  display: flex;
  align-items: center;
  overflow: hidden;

  &:hover > ${CellClipboard} {
    opacity: 1;
  }

  &:hover > ${CellChildren} {
    -webkit-mask-image: linear-gradient(to right, rgba(0, 0, 0, 1) 50%, rgba(0, 0, 0, 0) calc(100% - 15px));
  }
`
