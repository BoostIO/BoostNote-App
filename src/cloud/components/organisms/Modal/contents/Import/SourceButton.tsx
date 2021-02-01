import React from 'react'
import {
  StyledSourceButton,
  StyledSourceButtonLogoWrap,
  StyledSourceButtonTextWrap,
} from './styled'

interface SourceButtonProps {
  title: string
  description: string
  onClick?: () => void
  logo: React.ReactNode
}

const SourceButton = ({
  title,
  description,
  onClick,
  logo,
}: SourceButtonProps) => (
  <StyledSourceButton onClick={onClick}>
    <StyledSourceButtonLogoWrap>{logo}</StyledSourceButtonLogoWrap>
    <StyledSourceButtonTextWrap>
      <strong>{title}</strong>
      <span>{description}</span>
    </StyledSourceButtonTextWrap>
  </StyledSourceButton>
)

export default SourceButton
