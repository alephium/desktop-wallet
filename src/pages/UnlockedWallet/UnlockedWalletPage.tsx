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

import { AnimatePresence, motion } from 'framer-motion'
import styled from 'styled-components'

import { fadeIn } from '@/animations'
import InfoMessage from '@/components/InfoMessage'
import { UnlockedWalletPanel } from '@/pages/UnlockedWallet/UnlockedWalletLayout'

interface UnlockedWalletPageProps {
  title: string
  subtitle: string
  infoMessage?: string
  infoMessageLink?: string
  isInfoMessageVisible?: boolean
  closeInfoMessage?: () => void
  className?: string
}

const UnlockedWalletPage: FC<UnlockedWalletPageProps> = ({
  title,
  subtitle,
  infoMessage,
  infoMessageLink,
  isInfoMessageVisible,
  closeInfoMessage,
  children,
  className
}) => (
  <motion.div {...fadeIn} className={className}>
    <PageHeader>
      <div>
        {title && <PageTitle>{title}</PageTitle>}
        {subtitle && <PageSubtitle>{subtitle}</PageSubtitle>}
      </div>
      <div>
        <AnimatePresence>
          {infoMessage && isInfoMessageVisible && (
            <InfoMessage link={infoMessageLink} onClose={closeInfoMessage}>
              {infoMessage}
            </InfoMessage>
          )}
        </AnimatePresence>
      </div>
    </PageHeader>
    {children}
  </motion.div>
)

export default styled(UnlockedWalletPage)`
  display: flex;
  flex-direction: column;
  flex: 1;
`

const PageHeader = styled(UnlockedWalletPanel)`
  display: flex;
  justify-content: space-between;
  gap: 40px;
  margin-top: 35px;
  margin-bottom: 50px;
  margin-left: var(--spacing-4);
`

const PageTitle = styled.h1`
  font-size: 34px;
  font-weight: var(--fontWeight-semiBold);
  margin-top: 0;
  margin-bottom: 20px;
`

const PageSubtitle = styled.div`
  max-width: 400px;
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 14px;
`
