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

import { SweepAddressTransaction } from 'alephium-js/dist/api/api-alephium'
import { Info } from 'lucide-react'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import Amount from '../../components/Amount'
import InfoBox from '../../components/InfoBox'
import AddressSelect from '../../components/Inputs/AddressSelect'
import Modal, { ModalFooterButton, ModalFooterButtons } from '../../components/Modal'
import HorizontalDivider from '../../components/PageComponents/HorizontalDivider'
import { Address, useAddressesContext } from '../../contexts/addresses'
import { useGlobalContext } from '../../contexts/global'
import { getHumanReadableError } from '../../utils/api'

type SweepAddress = Address | undefined

interface AddressSweepModal {
  sweepAddress?: SweepAddress
  onClose: () => void
  onSuccessfulSweep: () => void
}

const AddressSweepModal = ({ sweepAddress, onClose, onSuccessfulSweep }: AddressSweepModal) => {
  const { addresses, mainAddress } = useAddressesContext()
  const fromAddress = sweepAddress || mainAddress
  const toAddressOptions = addresses.filter(({ hash }) => hash !== fromAddress?.hash)
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
  const [unsignedTxs, setUnsignedTxs] = useState<SweepAddressTransaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const buildTransactions = async () => {
      if (!client || !sweepAddresses.from || !sweepAddresses.to) return
      setIsLoading(true)
      try {
        const txCreateResp = await client.clique.transactionConsolidateUTXOs(
          sweepAddresses.from.publicKey,
          sweepAddresses.from.hash,
          sweepAddresses.to.hash
        )
        setUnsignedTxs(txCreateResp.data.unsignedTxs)
        setFee(
          txCreateResp.data.unsignedTxs.reduce((acc, tx) => acc + BigInt(tx.gasPrice) * BigInt(tx.gasAmount), BigInt(0))
        )
      } catch (e) {
        setSnackbarMessage({
          text: getHumanReadableError(e, 'Error while building transaction'),
          type: 'alert',
          duration: 5000
        })
      }
      setIsLoading(false)
    }

    buildTransactions()
  }, [client, setSnackbarMessage, sweepAddresses.from, sweepAddresses.to])

  const onSweepClick = async () => {
    if (!client || !sweepAddresses.from || !sweepAddresses.to) return
    setIsLoading(true)
    try {
      for (const { txId, unsignedTx } of unsignedTxs) {
        const txSendResp = await signAndSendTransaction(
          txId,
          unsignedTx,
          sweepAddresses.from.hash,
          sweepAddresses.from.privateKey
        )
        if (txSendResp) {
          sweepAddresses.from.addPendingTransaction({
            txId: txSendResp.data.txId,
            fromAddress: sweepAddresses.from.hash,
            toAddress: sweepAddresses.to.hash,
            timestamp: new Date().getTime(),
            amount: '',
            type: 'consolidation',
            network: currentNetwork
          })
          setAddress(sweepAddresses.from)
        }
      }
      onClose()
      onSuccessfulSweep()
    } catch (e) {
      setSnackbarMessage({
        text: getHumanReadableError(e, `Error while sweeping address ${sweepAddresses.from}`),
        type: 'alert',
        duration: 5000
      })
    }
    setIsLoading(false)
  }

  const signAndSendTransaction = async (txId: string, unsignedTx: string, toAddress: string, privateKey: string) => {
    if (!client) return
    const signature = client.clique.transactionSign(txId, privateKey)
    return await client.clique.transactionSend(toAddress, unsignedTx, signature)
  }

  const onAddressChange = (type: 'from' | 'to', address: Address) => {
    setSweepAddresses((prev) => ({ ...prev, [type]: address }))
  }

  if (!sweepAddresses.from || !sweepAddresses.to) return null

  return (
    <Modal title={sweepAddress ? 'Sweep address' : 'Consolidate UTXOs'} onClose={onClose} isLoading={isLoading}>
      <Content>
        <AddressSelect
          placeholder="From address"
          title="Select the address to sweep the funds from."
          options={addresses}
          defaultAddress={sweepAddresses.from}
          onAddressChange={(newAddress) => onAddressChange('from', newAddress)}
          disabled={sweepAddress !== undefined}
          id="from-address"
        />
        <AddressSelect
          placeholder="To address"
          title="Select the address to sweep the funds to."
          options={toAddressOptions}
          defaultAddress={sweepAddresses.to}
          onAddressChange={(newAddress) => onAddressChange('to', newAddress)}
          id="to-address"
        />
        <InfoBox Icon={Info} contrast noBorders>
          This operation will sweep all funds from{' '}
          <ColoredWord color={sweepAddresses.from.settings.color}>{sweepAddresses.from.displayName()}</ColoredWord> and
          transfer them to{' '}
          <ColoredWord color={sweepAddresses.to.settings.color}>{sweepAddresses.to.displayName()}</ColoredWord>.
        </InfoBox>
        <Fee>
          Fee
          <Amount value={fee} fadeDecimals />
        </Fee>
      </Content>
      <HorizontalDivider narrow />
      <ModalFooterButtons>
        <ModalFooterButton secondary onClick={onClose}>
          Cancel
        </ModalFooterButton>
        <ModalFooterButton onClick={onSweepClick} disabled={unsignedTxs.length === 0}>
          {sweepAddress ? 'Sweep' : 'Consolidate'}
        </ModalFooterButton>
      </ModalFooterButtons>
    </Modal>
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
