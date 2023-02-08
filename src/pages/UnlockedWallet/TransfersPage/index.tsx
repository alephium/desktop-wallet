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

// import { Transaction } from '@alephium/sdk/api/explorer'
import { motion } from 'framer-motion'
import { useState } from 'react'

import { fadeIn } from '@/animations'
import ModalPortal from '@/modals/ModalPortal'
// import TransactionDetailsModal from '@/modals/TransactionDetailsModal'
import { AddressConfirmedTransaction } from '@/types/transactions'

import { UnlockedWalletPanel } from '../UnlockedWalletLayout'
import TransactionList from './TransactionList'

const TransfersPage = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<AddressConfirmedTransaction>()

  return (
    <motion.div {...fadeIn}>
      <UnlockedWalletPanel top>
        <TransactionList onTransactionClick={setSelectedTransaction} />
        <ModalPortal>
          {selectedTransaction?.hash}
          {/* TODO: Uncomment when dependency from contexts/addresses is removed */}
          {/* {selectedTransaction && (
            <TransactionDetailsModal
              address={selectedTransaction.address}
              transaction={selectedTransaction}
              onClose={() => setSelectedTransaction(undefined)}
            />
          )} */}
        </ModalPortal>
      </UnlockedWalletPanel>
    </motion.div>
  )
}

export default TransfersPage
