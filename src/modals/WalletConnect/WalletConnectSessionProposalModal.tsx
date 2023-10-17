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

import { AlertTriangle, PlusSquare } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AssetLogo from '@/components/AssetLogo'
import InfoBox from '@/components/InfoBox'
import AddressSelect from '@/components/Inputs/AddressSelect'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { selectAddressesInGroup } from '@/storage/addresses/addressesSelectors'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import { networkPresetSwitched } from '@/storage/settings/networkActions'
import { Address } from '@/types/addresses'
import { SessionProposalEvent } from '@/types/walletConnect'
import { getRandomLabelColor } from '@/utils/colors'
import { cleanUrl } from '@/utils/misc'
import { isNetworkValid, parseSessionProposalEvent } from '@/utils/walletConnect'

interface WalletConnectSessionProposalModalProps {
  approveProposal: (signerAddress: Address) => Promise<void>
  rejectProposal: () => Promise<void>
  proposalEvent: SessionProposalEvent
  onClose: () => void
}

const WalletConnectSessionProposalModal = ({
  onClose,
  approveProposal,
  rejectProposal,
  proposalEvent
}: WalletConnectSessionProposalModalProps) => {
  const { t } = useTranslation()
  const posthog = usePostHog()
  const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const dispatch = useAppDispatch()
  const { requiredChainInfo, metadata } = parseSessionProposalEvent(proposalEvent)
  const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, requiredChainInfo?.addressGroup))
  const { generateAddress } = useAddressGeneration()

  const [signerAddress, setSignerAddress] = useState<Address>()

  const group = requiredChainInfo?.addressGroup

  const showNetworkWarning =
    requiredChainInfo?.networkId && !isNetworkValid(requiredChainInfo.networkId, currentNetworkId)

  useEffect(() => {
    setSignerAddress(
      addressesInGroup.length > 0 ? addressesInGroup.find((a) => a.isDefault) ?? addressesInGroup[0] : undefined
    )
  }, [addressesInGroup])

  const handleSwitchNetworkPress = async () => {
    if (requiredChainInfo?.networkId === 'mainnet' || requiredChainInfo?.networkId === 'testnet') {
      dispatch(networkPresetSwitched(requiredChainInfo?.networkId))
    }
  }

  const generateAddressInGroup = () => {
    const address = generateAddress({ group })
    saveNewAddresses([{ ...address, isDefault: false, color: getRandomLabelColor() }])

    posthog.capture('New address created through WalletConnect modal')
  }

  const rejectAndCloseModal = async () => {
    rejectProposal()
    onClose()

    posthog.capture('Rejected WalletConnect connection by closing modal')
  }

  return (
    <CenteredModal
      title={
        metadata.description ? t('Connect to {{ dAppUrl }}', { dAppUrl: cleanUrl(metadata.url) }) : t('Connect to dApp')
      }
      subtitle={metadata.description || metadata.url}
      onClose={rejectAndCloseModal}
      Icon={() =>
        metadata?.icons &&
        metadata.icons.length > 0 &&
        metadata.icons[0] && <AssetLogo assetImageUrl={metadata.icons[0]} assetId={metadata.url} size={50} />
      }
    >
      {showNetworkWarning ? (
        <>
          <Section>
            <InfoBox label="Switch network" Icon={AlertTriangle}>
              You are currently connected to <Highlight>{currentNetworkName}</Highlight>, but the dApp requires a
              connection to <Highlight>{requiredChainInfo?.networkId}</Highlight>.
            </InfoBox>
          </Section>
          <ModalFooterButtons>
            <ModalFooterButton role="secondary" onClick={rejectProposal}>
              {t('Decline')}
            </ModalFooterButton>
            <ModalFooterButton onClick={handleSwitchNetworkPress}>{t('Switch network')}</ModalFooterButton>
          </ModalFooterButtons>
        </>
      ) : !signerAddress ? (
        <>
          <Section>
            <InfoBox label="New address needed" Icon={PlusSquare}>
              The dApp asks for an address in group <Highlight> {requiredChainInfo?.addressGroup}</Highlight>. Click
              below to generate one!
            </InfoBox>
          </Section>
          <ModalFooterButtons>
            <ModalFooterButton role="secondary" onClick={rejectProposal}>
              {t('Decline')}
            </ModalFooterButton>
            <ModalFooterButton onClick={generateAddressInGroup}>{t('Generate new address')}</ModalFooterButton>
          </ModalFooterButtons>
        </>
      ) : (
        <>
          <Paragraph style={{ marginBottom: 0 }}>
            {group === undefined ? (
              <Trans
                t={t}
                i18nKey="walletConnectProposalMessage"
                values={{
                  dAppUrl: cleanUrl(metadata.url)
                }}
                components={{
                  1: <Highlight />
                }}
              >
                {'Connect to <1>{{ dAppUrl }}</1> with one of your addresses:'}
              </Trans>
            ) : (
              <Trans
                t={t}
                i18nKey="walletConnectProposalMessageWithGroup"
                values={{
                  dAppUrl: cleanUrl(metadata.url),
                  group
                }}
                components={{
                  1: <Highlight />,
                  3: <Highlight />
                }}
              >
                {'Connect to <1>{{ dAppUrl }}</1> with one of your addresses in group <3>{{ group }}</3>:'}
              </Trans>
            )}
          </Paragraph>
          <AddressSelect
            label={t('Connect with address')}
            title={t('Select an address to connect with.')}
            options={addressesInGroup}
            defaultAddress={signerAddress}
            onAddressChange={setSignerAddress}
            id="from-address"
            emptyListPlaceholder={t('There are no addresses in the required group: {{ group }}', { group })}
          />
          <ModalFooterButtons>
            <ModalFooterButton role="secondary" onClick={rejectProposal}>
              {t('Decline')}
            </ModalFooterButton>
            <ModalFooterButton variant="valid" onClick={() => approveProposal(signerAddress)} disabled={!signerAddress}>
              {t('Accept')}
            </ModalFooterButton>
          </ModalFooterButtons>
        </>
      )}
    </CenteredModal>
  )
}

export default WalletConnectSessionProposalModal

const Highlight = styled.span`
  color: ${({ theme }) => theme.global.accent};
`
