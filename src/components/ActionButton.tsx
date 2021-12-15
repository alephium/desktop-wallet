import styled, { useTheme } from 'styled-components'
import { LucideProps } from 'lucide-react'
import { useHistory } from 'react-router-dom'

const ActionButton = ({
  Icon,
  label,
  link,
  onClick
}: {
  Icon: (props: LucideProps) => JSX.Element
  label: string
  link?: string
  onClick?: () => void
}) => {
  const theme = useTheme()
  const history = useHistory()

  const handleClick = () => {
    if (link) {
      history.push(link)
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <ActionButtonContainer onClick={handleClick}>
      <ActionContent>
        <ActionIcon>
          <Icon color={theme.font.primary} size={18} />
        </ActionIcon>
        <ActionLabel>{label}</ActionLabel>
      </ActionContent>
    </ActionButtonContainer>
  )
}

const ActionLabel = styled.label`
  color: ${({ theme }) => theme.font.secondary};
  text-align: center;
  transition: all 0.1s ease-out;
`

const ActionContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;

  * {
    cursor: pointer;
  }
`

const ActionIcon = styled.div`
  display: flex;
  margin-right: var(--spacing-3);
  opacity: 0.5;
  transition: all 0.1s ease-out;
`

const ActionButtonContainer = styled.div`
  display: flex;
  align-items: stretch;
  width: 100%;
  height: 50px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }

  &:hover {
    cursor: pointer;
    ${ActionLabel} {
      color: ${({ theme }) => theme.global.accent};
    }

    ${ActionIcon} {
      opacity: 1;
    }
  }
`

export default ActionButton
