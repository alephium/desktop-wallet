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

import dayjs from 'dayjs'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import FooterButton from '@/components/Buttons/FooterButton'
import Select from '@/components/Inputs/Select'
import Paragraph from '@/components/Paragraph'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { CenteredModalProps } from '@/modals/CenteredModal'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
import { csvFileGenerationFinished, fetchTransactionsCsv } from '@/storage/transactions/transactionsActions'
import { AddressHash } from '@/types/addresses'
import { TransactionTimePeriod } from '@/types/transactions'
import { getCsvExportTimeRangeQueryParams } from '@/utils/csvExport'
import { generateCsvFile } from '@/utils/csvExport'
import { timePeriodsOptions } from '@/utils/transactions'

interface CSVExportModalProps extends CenteredModalProps {
  addressHash: AddressHash
}

const CSVExportModal = ({ addressHash, ...props }: CSVExportModalProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const posthog = usePostHog()

  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TransactionTimePeriod>('24h')

  if (!address) return null

  const handleExportClick = () => {
    props.onClose()
    getCSVFile()

    posthog.capture('Exported CSV', { time_period: selectedTimePeriod })
  }

  const getCSVFile = async () => {
    const now = dayjs()
    const timeRangeQueryParams = getCsvExportTimeRangeQueryParams(selectedTimePeriod, now)

    const csvData = await dispatch(fetchTransactionsCsv({ addressHash, ...timeRangeQueryParams })).unwrap()
    const fileName = `${addressHash}__${selectedTimePeriod}__${now.format('DD-MM-YYYY')}`
    generateCsvFile(csvData, fileName)

    dispatch(csvFileGenerationFinished())
  }

  return (
    <CenteredModal title={t('Export address transactions')} subtitle={address.label || address.hash} {...props}>
      <Paragraph>
        {t(
          'You can download the address transaction history for a selected time period. This can be useful for tax reporting.'
        )}
      </Paragraph>
      <Select
        title={t('Time period')}
        options={timePeriodsOptions}
        controlledValue={timePeriodsOptions.find((option) => option.value === selectedTimePeriod)}
        id="timeperiod"
        onSelect={setSelectedTimePeriod}
      />
      <FooterButton onClick={handleExportClick}>{t('Export')}</FooterButton>
    </CenteredModal>
  )
}

export default CSVExportModal
