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

import { isEmpty } from 'lodash'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import Input from '@/components/Inputs/Input'
import { Contact } from '@/types/contacts'
import { requiredErrorMessage, validateIsAddressValid } from '@/utils/formValidation'

import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'

interface ContactFormModalProps {
  contact?: Contact
  onClose: () => void
}

const ContactFormModal = ({ contact, onClose }: ContactFormModalProps) => {
  const { t } = useTranslation()
  const { control, handleSubmit, formState } = useForm<Contact>({
    defaultValues: contact ?? { name: '', address: '' },
    mode: 'onChange'
  })

  const errors = formState.errors
  const isFormValid = isEmpty(errors)

  const saveContact = (formData: Contact) => {
    console.log('Saving...', formData)
  }

  return (
    <CenteredModal title={t(contact ? 'Edit contact' : 'New contact')} onClose={onClose}>
      <InputFieldsColumn>
        <Controller
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('Name')}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.name?.type === 'required' && requiredErrorMessage}
              isValid={!!value && !errors.name}
            />
          )}
          rules={{
            required: true
          }}
          control={control}
        />
        <Controller
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('Address')}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              error={errors.address?.type === 'required' ? requiredErrorMessage : errors.address?.message}
              isValid={!!value && !errors.address}
            />
          )}
          rules={{
            required: true,
            validate: validateIsAddressValid
          }}
          control={control}
        />
      </InputFieldsColumn>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t('Cancel')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleSubmit(saveContact)} disabled={!isFormValid}>
          {t('Save')}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

export default ContactFormModal
