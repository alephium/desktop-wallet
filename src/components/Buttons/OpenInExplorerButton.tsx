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

import { ExternalLink } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAppSelector } from '@/hooks/redux'
import { openInWebBrowser } from '@/utils/misc'

interface OpenInExplorerButtonProps {
  address: string
  className?: string
}

const OpenInExplorerButton = ({ address, className }: OpenInExplorerButtonProps) => {
  const { t } = useTranslation()
  const { explorerUrl } = useAppSelector((state) => state.network.settings)

  const handleShowInExplorer = () => {
    if (!explorerUrl) return

    openInWebBrowser(`${explorerUrl}/#/addresses/${address}`)
  }

  return (
    <ExternalLink
      className={className}
      size={15}
      onClick={handleShowInExplorer}
      onKeyPress={handleShowInExplorer}
      role="link"
      tabIndex={0}
      data-tooltip-id="default"
      data-tooltip-content={t('Open in explorer')}
    />
  )
}

export default styled(OpenInExplorerButton)`
  cursor: pointer;
  color: ${({ theme }) => theme.font.secondary};
`
