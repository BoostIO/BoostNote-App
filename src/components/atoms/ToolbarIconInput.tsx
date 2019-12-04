import React from 'react'
import styled from '../../lib/styled'
import Icon from './Icon'
const StyledContainer = styled.div`
  position: relative;
  height: 22px;
  .icon {
    position: absolute;
    top: 4px;
    left: 4px;
    height: 14px;
    width: 14px;
    z-index: 0;
  }
  .input {
    position: relative;
    width: 100%;
    background-color: transparent;
    border: solid 1px ${({ theme }: any) => theme.colors.border};
    height: 22px;
    padding-left: 18px;
    border-radius: 2px;
    box-sizing: border-box;
  }
`

interface ToolbarIconInputProps {
  className?: string
  iconPath: string
  value: string
  onChange: React.ChangeEventHandler<HTMLInputElement>
}

const ToolbarIconInput = ({
  className,
  iconPath,
  value,
  onChange
}: ToolbarIconInputProps) => {
  return (
    <StyledContainer className={className}>
      <Icon path={iconPath} className='icon' />
      <input className='input' value={value} onChange={onChange} />
    </StyledContainer>
  )
}

export default ToolbarIconInput
