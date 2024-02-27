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

import { LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import CenteredModal, { CenteredModalProps, ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

interface ConfirmModalProps extends CenteredModalProps {
  Icon?: LucideIcon
  onConfirm: () => void
}

const ConfirmModal: FC<ConfirmModalProps> = ({ onConfirm, Icon, children, ...props }) => {
  const { t } = useTranslation()

  return (
    <CenteredModal title={t('Confirm')} {...props}>
      <InfoBox Icon={Icon}>{children}</InfoBox>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={props.onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={onConfirm}>{t('Confirm')}</ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default ConfirmModal
