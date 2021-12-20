import { ReactNode } from 'react'
import styled from 'styled-components'

const InlineLabelValueInput = ({
  label,
  InputComponent,
  onValueChange,
  description,
  className
}: {
  label: string
  InputComponent: ReactNode
  onValueChange: (v: string) => void
  description?: string
  className?: string
}) => {
  return (
    <KeyValueInputContainer className={className}>
      <KeyContainer>
        {label}
        {description && <DescriptionContainer>{description}</DescriptionContainer>}
      </KeyContainer>
      <InputContainer>{InputComponent}</InputContainer>
    </KeyValueInputContainer>
  )
}

const KeyValueInputContainer = styled.div`
  display: flex;
  padding: var(--spacing-4) var(--spacing-3);
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
`

const KeyContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

const DescriptionContainer = styled.div``

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`

export default InlineLabelValueInput
