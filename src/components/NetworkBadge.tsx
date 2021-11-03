import styled from 'styled-components'
import { useCurrentNetwork } from '../utils/clients'

const NetworkBadge = () => {
  const currentNetwork = useCurrentNetwork()

  return <BadgeContainer>{currentNetwork}</BadgeContainer>
}

const BadgeContainer = styled.div`
  padding: 5px 10px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.bg.primary};
  color: ${({ theme }) => theme.font.secondary};
`

export default NetworkBadge
