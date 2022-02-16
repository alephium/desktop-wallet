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
import styled, { useTheme } from 'styled-components'

import Amount from '../../components/Amount'
import Button from '../../components/Button'
import InfoBox from '../../components/InfoBox'
import ModalCentered, { HeaderContent, HeaderLogo } from '../../components/ModalCentered'
import { Section } from '../../components/PageComponents/PageContainers'
import Spinner from '../../components/Spinner'

interface ConsolidateUTXOsModalProps {
  onConsolidateClick: () => void
  onClose: () => void
  fee: bigint | undefined
}

const ConsolidateUTXOsModal = ({ onConsolidateClick, onClose, fee }: ConsolidateUTXOsModalProps) => {
  const theme = useTheme()

  return (
    <ModalCentered title="Consolidate UTXOs" onClose={onClose}>
      <HeaderContent>
        <HeaderLogo>
          <Codesandbox color={theme.global.accent} size={'70%'} strokeWidth={0.7} />
        </HeaderLogo>
        <Section>
          <InfoBox
            importance="accent"
            text="It appears that your wallet has too many UTXOs to be able to send this transaction. Please, consolidate
            (merge) your UTXOs first. This will cost a small fee."
          />
          <Fee>
            Fee
            {fee ? <Amount value={fee} fadeDecimals /> : <Spinner size="12px" />}
          </Fee>
          <Button onClick={onConsolidateClick} submit disabled={!fee}>
            Consolidate
          </Button>
        </Section>
      </HeaderContent>
    </ModalCentered>
  )
}

const Fee = styled.div`
  padding: 12px;
  display: flex;
  gap: 80px;
  width: 100%;
`

export default ConsolidateUTXOsModal
