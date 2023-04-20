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

import { getHumanReadableError } from '@alephium/sdk'
import { SweepAddressTransaction } from '@alephium/sdk/api/alephium'
import { Info } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { buildSweepTransactions, signAndSendTransaction } from '@/api/transactions'
import Amount from '@/components/Amount'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import InfoBox from '@/components/InfoBox'
import AddressSelect from '@/components/Inputs/AddressSelect'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import {
  transactionBuildFailed,
  transactionSendFailed,
  transactionSent
} from '@/storage/transactions/transactionsActions'
import { Address } from '@/types/addresses'
import { getName } from '@/utils/addresses'

type SweepAddress = Address | undefined

interface AddressSweepModal {
  sweepAddress?: SweepAddress
  onClose: () => void
  onSuccessfulSweep?: () => void
}

const AddressSweepModal = ({ sweepAddress, onClose, onSuccessfulSweep }: AddressSweepModal) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const addresses = useAppSelector(selectAllAddresses)
  const posthog = usePostHog()

  const fromAddress = sweepAddress || defaultAddress
  const toAddressOptions = sweepAddress ? addresses.filter(({ hash }) => hash !== fromAddress?.hash) : addresses

  const [sweepAddresses, setSweepAddresses] = useState<{
    from: SweepAddress
    to: SweepAddress
  }>({
    from: fromAddress,
    to: toAddressOptions.length > 0 ? toAddressOptions[0] : fromAddress
  })
  const [fee, setFee] = useState(BigInt(0))
  const [builtUnsignedTxs, setBuiltUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const buildTransactions = async () => {
      if (!sweepAddresses.from || !sweepAddresses.to) return
      setIsLoading(true)
      try {
        const { unsignedTxs, fees } = await buildSweepTransactions(sweepAddresses.from, sweepAddresses.to.hash)
        setBuiltUnsignedTxs(unsignedTxs)
        setFee(fees)
      } catch (e) {
        dispatch(transactionBuildFailed(getHumanReadableError(e, t('Error while building transaction'))))
      }
      setIsLoading(false)
    }

    buildTransactions()
  }, [dispatch, sweepAddresses.from, sweepAddresses.to, t])

  const onSweepClick = async () => {
    if (!sweepAddresses.from || !sweepAddresses.to) return
    setIsLoading(true)
    try {
      for (const { txId, unsignedTx } of builtUnsignedTxs) {
        const data = await signAndSendTransaction(sweepAddresses.from, txId, unsignedTx)

        dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: sweepAddresses.from.hash,
            toAddress: sweepAddresses.to.hash,
            timestamp: new Date().getTime(),
            type: 'sweep',
            status: 'pending'
          })
        )
      }

      onClose()
      onSuccessfulSweep && onSuccessfulSweep()

      posthog?.capture('Swept address assets')
    } catch (e) {
      dispatch(
        transactionSendFailed(
          getHumanReadableError(e, t('Error while sweeping address {{ from }}', { from: sweepAddresses.from }))
        )
      )
    }
    setIsLoading(false)
  }

  const onAddressChange = (type: 'from' | 'to', address: Address) => {
    setSweepAddresses((prev) => ({ ...prev, [type]: address }))
  }

  if (!sweepAddresses.from || !sweepAddresses.to) return null

  return (
    <CenteredModal
      title={sweepAddress ? t`Sweep address` : t`Consolidate UTXOs`}
      onClose={onClose}
      isLoading={isLoading}
    >
      <Content>
        <AddressSelect
          label={t`From address`}
          title={t`Select the address to sweep the funds from.`}
          options={addresses}
          defaultAddress={sweepAddresses.from}
          onAddressChange={(newAddress) => onAddressChange('from', newAddress)}
          disabled={sweepAddress !== undefined}
          id="from-address"
          hideEmptyAvailableBalance
        />
        <AddressSelect
          label={t`To address`}
          title={t`Select the address to sweep the funds to.`}
          options={toAddressOptions}
          defaultAddress={sweepAddresses.to}
          onAddressChange={(newAddress) => onAddressChange('to', newAddress)}
          id="to-address"
        />
        <InfoBox Icon={Info} contrast noBorders>
          <Trans
            t={t}
            i18nKey="sweepOperationFromTo"
            values={{ from: getName(sweepAddresses.from), to: getName(sweepAddresses.to) }}
            components={{
              1: <ColoredWord color={sweepAddresses.from.color} />,
              3: <ColoredWord color={sweepAddresses.to.color} />
            }}
          >
            {'This operation will sweep all funds from <1>{{ from }}</1> and transfer them to <3>{{ to }}</3>.'}
          </Trans>
        </InfoBox>
        <Fee>
          {t`Fee`}
          <Amount value={fee} />
        </Fee>
      </Content>
      <HorizontalDivider narrow />
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onClose}>
          {t`Cancel`}
        </ModalFooterButton>
        <ModalFooterButton onClick={onSweepClick} disabled={builtUnsignedTxs.length === 0}>
          {sweepAddress ? t`Sweep` : t`Consolidate`}
        </ModalFooterButton>
      </ModalFooterButtons>
    </CenteredModal>
  )
}

const Fee = styled.div`
  padding: 12px;
  display: flex;
  gap: 80px;
  width: 100%;
`

const ColoredWord = styled.span`
  color: ${({ color }) => color};
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-3);
`

export default AddressSweepModal
