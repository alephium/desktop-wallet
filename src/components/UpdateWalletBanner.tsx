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

import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Banner from '@/components/Banner'
import Button from '@/components/Button'
import { useGlobalContext } from '@/contexts/global'
import { links } from '@/utils/links'
import { openInWebBrowser } from '@/utils/misc'

interface UpdateWalletBannerProps {
  className?: string
}

const UpdateWalletBanner = ({ className }: UpdateWalletBannerProps) => {
  const { t } = useTranslation()
  const { triggerNewVersionDownload, newVersion, requiresManualDownload } = useGlobalContext()

  return (
    <Banner className={className} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {requiresManualDownload ? (
        <>
          <UpdateMessage>
            {t(
              'Version {{ newVersion }} is available. Please, download it and install it to avoid any issues with wallet.',
              {
                newVersion
              }
            )}
          </UpdateMessage>
          <ButtonStyled short onClick={() => openInWebBrowser(links.latestRelease)}>
            {t('Download')}
          </ButtonStyled>
        </>
      ) : (
        <>
          <UpdateMessage>
            {t('Version {{ newVersion }} is available. Click "Update" to avoid any issues with wallet.', {
              newVersion
            })}
          </UpdateMessage>
          <ButtonStyled short onClick={triggerNewVersionDownload}>
            {t('Update')}
          </ButtonStyled>
        </>
      )}
    </Banner>
  )
}

export default styled(UpdateWalletBanner)`
  gap: 50px;
`

const UpdateMessage = styled.span`
  font-weight: var(--fontWeight-semiBold);
`

const ButtonStyled = styled(Button)`
  border: 1px solid var(--color-white);
  height: 28px;

  &:hover {
    border-color: transparent;
  }
`
