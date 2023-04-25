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

import { useTranslation } from 'react-i18next'

import Box from '@/components/Box'
import FooterButton from '@/components/Buttons/FooterButton'
import InfoBox from '@/components/InfoBox'
import { useAppSelector } from '@/hooks/redux'
import CheckAddressesBox from '@/modals/SendModals/CheckAddressesBox'
import CheckAmountsBox from '@/modals/SendModals/CheckAmountsBox'
import CheckFeeLockTimeBox from '@/modals/SendModals/CheckFeeLockTimeBox'
import CheckModalContent from '@/modals/SendModals/CheckModalContent'
import InfoRow from '@/modals/SendModals/InfoRow'
import { CheckTxProps, DeployContractTxData } from '@/types/transactions'

const DeployContractCheckTxModalContent = ({ data, fees, onSubmit }: CheckTxProps<DeployContractTxData>) => {
  const { t } = useTranslation()
  const settings = useAppSelector((s) => s.settings)

  return (
    <>
      <CheckModalContent>
        {data.initialAlphAmount && <CheckAmountsBox assetAmounts={[data.initialAlphAmount]} />}
        <CheckAddressesBox fromAddress={data.fromAddress} />
        {data.issueTokenAmount && (
          <Box>
            <InfoRow label={t('Issue token amount')}>{data.issueTokenAmount}</InfoRow>
          </Box>
        )}
        <CheckFeeLockTimeBox fee={fees} />
        <InfoBox label={t('Bytecode')} text={data.bytecode} wordBreak />
      </CheckModalContent>
      <FooterButton onClick={onSubmit} variant={settings.passwordRequirement ? 'default' : 'valid'}>
        {t(settings.passwordRequirement ? 'Confirm' : 'Send')}
      </FooterButton>
    </>
  )
}

export default DeployContractCheckTxModalContent
