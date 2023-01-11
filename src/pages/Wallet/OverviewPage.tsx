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
import { AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import OverviewPageHeader from '../../components/OverviewPage/Header'
import OverviewPageTransactionList from '../../components/OverviewPage/TransactionList'
import { MainContent } from '../../components/PageComponents/PageContainers'
import { PageH2 } from '../../components/PageComponents/PageHeadings'
import { Address } from '../../contexts/addresses'
import TransactionDetailsModal from '../../modals/TransactionDetailsModal'

const OverviewPage = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction & { address: Address }>()
  const { t } = useTranslation()

  return (
    <MainContent>
      <OverviewPageHeader />
      <PageH2>{t`Transaction history`}</PageH2>
      <OverviewPageTransactionList onTransactionClick={setSelectedTransaction} />
      <AnimatePresence>
        {selectedTransaction && (
          <TransactionDetailsModal
            address={selectedTransaction.address}
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(undefined)}
          />
        )}
      </AnimatePresence>
    </MainContent>
  )
}

export default OverviewPage
