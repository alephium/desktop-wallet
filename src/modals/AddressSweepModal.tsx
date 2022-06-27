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

import { getHumanReadableError } from '@alephium/sdk'
import { SweepAddressTransaction } from '@alephium/sdk/api/alephium'
import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '../components/Amount'
import InfoBox from '../components/InfoBox'
import AddressSelect from '../components/Inputs/AddressSelect'
import HorizontalDivider from '../components/PageComponents/HorizontalDivider'
import { Address, useAddressesContext } from '../contexts/addresses'
import { useGlobalContext } from '../contexts/global'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from './CenteredModal'

type SweepAddress = Address | undefined

interface AddressSweepModal {
  sweepAddress?: SweepAddress
  onClose: () => void
  onSuccessfulSweep?: () => void
}

const AddressSweepModal = ({ sweepAddress, onClose, onSuccessfulSweep }: AddressSweepModal) => {
  const { t } = useTranslation('App')
  const { addresses, mainAddress } = useAddressesContext()
  const fromAddress = sweepAddress || mainAddress
  const toAddressOptions = sweepAddress ? addresses.filter(({ hash }) => hash !== fromAddress?.hash) : addresses
  const [sweepAddresses, setSweepAddresses] = useState<{
    from: SweepAddress
    to: SweepAddress
  }>({
    from: fromAddress,
    to: toAddressOptions.length > 0 ? toAddressOptions[0] : fromAddress
  })
  const [fee, setFee] = useState(BigInt(0))
  const { client, currentNetwork, setSnackbarMessage } = useGlobalContext()
  const { setAddress } = useAddressesContext()
  const [builtUnsignedTxs, setBuiltUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const buildTransactions = async () => {
      if (!client || !sweepAddresses.from || !sweepAddresses.to) return
      setIsLoading(true)
      try {
        const { unsignedTxs, fees } = await client.buildSweepTransactions(sweepAddresses.from, sweepAddresses.to.hash)
        setBuiltUnsignedTxs(unsignedTxs)
        setFee(fees)
      } catch (e) {
        setSnackbarMessage({
          text: getHumanReadableError(e, t`Error while building transaction`),
          type: 'alert',
          duration: 5000
        })
      }
      setIsLoading(false)
    }

    buildTransactions()
  }, [client, setSnackbarMessage, sweepAddresses.from, sweepAddresses.to, t])

  const onSweepClick = async () => {
    if (!client || !sweepAddresses.from || !sweepAddresses.to) return
    setIsLoading(true)
    try {
      for (const { txId, unsignedTx } of builtUnsignedTxs) {
        const txSendResp = await client.signAndSendTransaction(
          sweepAddresses.from,
          txId,
          unsignedTx,
          sweepAddresses.to.hash,
          'sweep',
          currentNetwork
        )
        if (txSendResp) {
          setAddress(sweepAddresses.from)
        }
      }
      onClose()
      onSuccessfulSweep && onSuccessfulSweep()
    } catch (e) {
      setSnackbarMessage({
        text: getHumanReadableError(e, t('Error while sweeping address {{ from }}', { from: sweepAddresses.from })),
        type: 'alert',
        duration: 5000
      })
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
          {t`This operation will sweep all funds from`}{' '}
          <ColoredWord color={sweepAddresses.from.settings.color}>{sweepAddresses.from.getName()}</ColoredWord>{' '}
          {t`and transfer them to`}{' '}
          <ColoredWord color={sweepAddresses.to.settings.color}>{sweepAddresses.to.getName()}</ColoredWord>.
        </InfoBox>
        <Fee>
          {t`Fee`}
          <Amount value={fee} fadeDecimals />
        </Fee>
      </Content>
      <HorizontalDivider narrow />
      <ModalFooterButtons>
        <ModalFooterButton secondary onClick={onClose}>
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
