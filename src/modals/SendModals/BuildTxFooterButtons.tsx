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

import { useTranslation } from 'react-i18next'

import { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

interface BuildTxFooterButtons {
  onSubmit: () => void
  onCancel: () => void
  isSubmitButtonActive: boolean | string
}

const BuildTxFooterButtons = ({ onSubmit, onCancel, isSubmitButtonActive }: BuildTxFooterButtons) => {
  const { t } = useTranslation()

  return (
    <ModalFooterButtons>
      <ModalFooterButton secondary onClick={onCancel}>
        {t`Cancel`}
      </ModalFooterButton>
      <ModalFooterButton onClick={onSubmit} disabled={!isSubmitButtonActive}>
        {t`Check`}
      </ModalFooterButton>
    </ModalFooterButtons>
  )
}

export default BuildTxFooterButtons
