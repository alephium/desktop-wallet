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

import { Edit3 } from 'lucide-react'
import { useState } from 'react'
import styled from 'styled-components'

import InfoBox from '../../components/InfoBox'
import ModalCentered from '../../components/ModalCentered'
import { Section } from '../../components/PageComponents/PageContainers'
import PasswordConfirmation from '../../components/PasswordConfirmation'
import { useGlobalContext } from '../../contexts/global'

const SecretPhraseModal = ({ onClose }: { onClose: () => void }) => {
  const { wallet } = useGlobalContext()
  const [isDisplayingPhrase, setIsDisplayingPhrase] = useState(false)

  return (
    <ModalCentered title="Secret phrase" onClose={onClose} focusMode>
      {!isDisplayingPhrase ? (
        <div>
          <PasswordConfirmation
            text="Type your password above to show your 24 words phrase."
            buttonText="Show"
            onCorrectPasswordEntered={() => setIsDisplayingPhrase(true)}
          />
        </div>
      ) : (
        <Section>
          <InfoBox
            text={'Carefully note down the 24 words. They are the keys to your wallet.'}
            Icon={Edit3}
            importance="alert"
          />
          <PhraseBox>{wallet?.mnemonic || 'No mnemonic was stored along with this wallet'}</PhraseBox>
        </Section>
      )}
    </ModalCentered>
  )
}

const PhraseBox = styled.div`
  width: 100%;
  padding: var(--spacing-4);
  color: ${({ theme }) => theme.font.contrastPrimary};
  font-weight: var(--fontWeight-semiBold);
  background-color: ${({ theme }) => theme.global.alert};
  border-radius: var(--radius);
  margin-bottom: var(--spacing-4);
`

export default SecretPhraseModal
