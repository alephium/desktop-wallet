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
import styled from 'styled-components'

import Button from '@/components/Button'

interface BuildTxFooterButtons {
  onSubmit: () => void
  isSubmitButtonActive: boolean | string
}

const BuildTxFooterButtons = ({ onSubmit, isSubmitButtonActive }: BuildTxFooterButtons) => {
  const { t } = useTranslation()

  return (
    <ModalFooter>
      <Button onClick={onSubmit} disabled={!isSubmitButtonActive}>
        {t('Check')}
      </Button>
    </ModalFooter>
  )
}

export default BuildTxFooterButtons

const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 50px;
`
