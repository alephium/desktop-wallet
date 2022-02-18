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

import { FC } from 'react'
import styled from 'styled-components'

import { FloatingPanel, MainContent } from '../../components/PageComponents/PageContainers'
import Spinner from '../../components/Spinner'
import { useAddressesContext } from '../../contexts/addresses'
import { deviceBreakPoints } from '../../style/globalStyles'

let OverviewPage: FC<{ className?: string }> = ({ className }) => {
  const { addresses, isLoadingData } = useAddressesContext()
  const totalNumberOfTx = addresses.reduce((acc, address) => acc + address.transactions.confirmed.length, 0)

  return (
    <MainContent>
      <FloatingPanel>
        <LastTransactionListHeader>
          <LastTransactionListTitle>Transactions ({totalNumberOfTx})</LastTransactionListTitle>
          {isLoadingData && <Spinner size={'16px'} />}
        </LastTransactionListHeader>
      </FloatingPanel>
    </MainContent>
  )
}

OverviewPage = styled(OverviewPage)``

const LastTransactionListHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-3);
`

const LastTransactionListTitle = styled.h2`
  margin: 0 var(--spacing-3) 0 0;

  @media ${deviceBreakPoints.mobile} {
    margin-left: 0;
  }
`

export default OverviewPage
