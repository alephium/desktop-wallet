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

import { Codesandbox } from 'lucide-react'
import { useTheme } from 'styled-components'

import { Button } from './Buttons'
import InfoBox from './InfoBox'
import { HeaderContent, HeaderLogo } from './Modal'
import Modal from './Modal'
import { Section } from './PageComponents/PageContainers'
import Spinner from './Spinner'

interface ConsolidateUTXOsModalProps {
  onConsolidateClick: () => void
  onClose: () => void
  isConsolidating: boolean
}

const ConsolidateUTXOsModal = ({ onConsolidateClick, onClose, isConsolidating }: ConsolidateUTXOsModalProps) => {
  const theme = useTheme()

  return (
    <Modal title="Consolidate UTXOs" onClose={onClose}>
      <HeaderContent>
        <HeaderLogo>
          {isConsolidating ? (
            <Spinner size="30%" />
          ) : (
            <Codesandbox color={theme.global.accent} size={'70%'} strokeWidth={0.7} />
          )}
        </HeaderLogo>
        <Section>
          <InfoBox
            importance="accent"
            text="It appears that your wallet has too many UTXOs to be able to send this transaction. Please, consolidate
            (merge) your UTXOs first. This will cost a small fee."
          />
          <Button onClick={onConsolidateClick} submit>
            Consolidate
          </Button>
        </Section>
      </HeaderContent>
    </Modal>
  )
}

export default ConsolidateUTXOsModal
