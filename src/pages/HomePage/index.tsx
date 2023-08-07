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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { fadeInSlowly } from '@/animations'
import AppHeader from '@/components/AppHeader'
import { FloatingPanel } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import { useAppSelector } from '@/hooks/redux'
import NewWalletActions from '@/pages/HomePage/NewWalletActions'
import UnlockPanel from '@/pages/HomePage/UnlockPanel'
import LockedWalletLayout from '@/pages/LockedWalletLayout'

const HomePage = () => {
  const { t } = useTranslation()
  const hasAtLeastOneWallet = useAppSelector((state) => state.global.wallets.length > 0)

  const [showNewWalletActions, setShowNewWalletActions] = useState(false)

  return (
    <LockedWalletLayout {...fadeInSlowly} animateSideBar>
      <FloatingPanel verticalAlign="center" horizontalAlign="center" transparentBg borderless>
        {showNewWalletActions ? (
          <>
            <PanelTitle useLayoutId={false} size="big" centerText>
              {t('New wallet')}
            </PanelTitle>
            <NewWalletActions onExistingWalletLinkClick={() => setShowNewWalletActions(false)} />
          </>
        ) : hasAtLeastOneWallet ? (
          <UnlockPanel onNewWalletLinkClick={() => setShowNewWalletActions(true)} />
        ) : (
          <>
            <PanelTitle useLayoutId={false} size="big" centerText>
              {t('Welcome.')}
            </PanelTitle>
            <NewWalletActions />
          </>
        )}
      </FloatingPanel>

      <AppHeader />
    </LockedWalletLayout>
  )
}

export default HomePage
