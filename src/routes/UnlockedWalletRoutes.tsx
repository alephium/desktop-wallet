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

import { useEffect } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { useAppSelector } from '@/hooks/redux'
import i18next from '@/i18n'
import AddressDetailsPage from '@/pages/UnlockedWallet/AddressDetailsPage'
import AddressesPage from '@/pages/UnlockedWallet/AddressesPage'
import OverviewPage from '@/pages/UnlockedWallet/OverviewPage'
import TransfersPage from '@/pages/UnlockedWallet/TransfersPage'
import UnlockedWalletLayout from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { loadContacts } from '@/utils/contacts'

const headerTitles: { [key: string]: string } = {
  '/wallet/overview': i18next.t('Overview'),
  '/wallet/transfers': i18next.t('Transfers')
}

const WalletRoutes = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => !!state.activeWallet.mnemonic)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    } else {
      loadContacts()
    }
  }, [isAuthenticated, navigate])

  return (
    <UnlockedWalletLayout headerTitle={headerTitles[location.pathname]}>
      <Routes location={location} key={location.pathname}>
        <Route path="overview" key="overview" element={<OverviewPage />} />
        <Route path="transfers" key="transfers" element={<TransfersPage />} />
        <Route path="addresses/:addressHash" key="address-details" element={<AddressDetailsPage />} />
        <Route path="addresses" key="addresses" element={<AddressesPage />} />
      </Routes>
    </UnlockedWalletLayout>
  )
}

export default WalletRoutes
