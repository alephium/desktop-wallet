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
import styled from 'styled-components'

import { openInWebBrowser } from '../../utils/misc'
import { loadStoredSettings } from '../../utils/settings'

interface OpenInExplorerButtonProps {
  address: string
  className?: string
}

const OpenInExplorerButton = ({ address, className }: OpenInExplorerButtonProps) => {
  const handleShowInExplorer = () => {
    const {
      network: { explorerUrl }
    } = loadStoredSettings()

    if (!explorerUrl) return

    // Remove forward slashes duplicates if needed
    const cleanURL = `${explorerUrl}/#/addresses/${address}`.replace(/([^:]\/)\/+/g, '$1')
    openInWebBrowser(cleanURL)
  }

  return <ExternalLink className={className} data-tip={'Open in explorer'} size={15} onClick={handleShowInExplorer} />
}

export default styled(OpenInExplorerButton)`
  margin-left: 10px;
  cursor: pointer;
  color: ${({ theme }) => theme.font.secondary};
`
