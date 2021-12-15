import styled from 'styled-components'

export const HorizontalDivider = styled.div`
  background-color: ${({ theme }) => theme.border.secondary};
  margin: var(--spacing-3) var(--spacing-1);
  height: 1px;
  width: 100%;
`
