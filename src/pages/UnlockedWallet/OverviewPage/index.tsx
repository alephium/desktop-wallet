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

import { Transaction } from '@alephium/sdk/api/explorer'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { fadeIn } from '@/animations'
import { Address, useAddressesContext } from '@/contexts/addresses'
import ModalPortal from '@/modals/ModalPortal'
import TransactionDetailsModal from '@/modals/TransactionDetailsModal'

import { UnlockedWalletPanel } from '../UnlockedWalletLayout'
import AssetsOverviewPanel from './AssetsOverviewPanel'
import TransactionList from './TransactionList'

const OverviewPage = () => {
  const { t } = useTranslation()
  const { isLoadingData } = useAddressesContext()

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction & { address: Address }>()

  return (
    <motion.div {...fadeIn}>
      <UnlockedWalletPanel>
        <AssetsOverviewPanel isLoading={isLoadingData} />
        <TransactionList onTransactionClick={setSelectedTransaction} />

        <ModalPortal>
          {selectedTransaction && (
            <TransactionDetailsModal
              address={selectedTransaction.address}
              transaction={selectedTransaction}
              onClose={() => setSelectedTransaction(undefined)}
            />
          )}
        </ModalPortal>
      </UnlockedWalletPanel>
    </motion.div>
  )
}

export default OverviewPage
