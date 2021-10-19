import styled from 'styled-components'
import tinycolor from 'tinycolor2'
import { loadSettingsOrDefault } from '../utils/clients'
import { openInNewWindow } from '../utils/misc'

const Address = ({ hash }: { hash: string }) => {
  const { explorerUrl } = loadSettingsOrDefault()

  const handleClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
    e.stopPropagation()
    openInNewWindow(`${explorerUrl}/#/addresses/${hash}`)
  }

  return <StyledAdress onClick={handleClick}>{hash}</StyledAdress>
}

const StyledAdress = styled.span`
   text-overflow: ellipsis;
  overflow: hidden;
  color: ${({ theme }) => theme.global.accent};

  &:hover {
    color: ${({ theme }) => tinycolor(theme.global.accent).darken(10).toString()};
  }
`

export default Address
