import React, { useState } from 'react'
import CustomButton, { PrimaryButtonProps } from './CustomButton'
import styled from '../../../lib/styled'
import ButtonGroup from './ButtonGroup'
import { StyledContextMenuContainer } from '../../organisms/Topbar/Controls/ControlsContextMenu/styled'
import ControlsContextMenuBackground from '../../organisms/Topbar/Controls/ControlsContextMenu/ControlsContextMenuBackground'

interface ButtonDropdownProps extends PrimaryButtonProps {
  title: string
  children?: React.ReactNode
}

const ButtonDropdown = ({
  title,
  children,
  variant,
  ...rest
}: ButtonDropdownProps) => {
  const [open, setOpen] = useState(false)
  return (
    <StyledButtonDropdown>
      <ButtonGroup>
        <CustomButton variant={variant} {...rest}>
          {title}
        </CustomButton>
        <CustomButton
          className={'btn-trigger'}
          style={{ padding: '0 8px 0 8px' }}
          variant={variant}
          onClick={() => setOpen((prev) => !prev)}
        >
          <CaratDown />
        </CustomButton>
      </ButtonGroup>
      {open && (
        <>
          <ControlsContextMenuBackground
            closeContextMenu={() => setOpen(false)}
          />
          <StyledContextMenuContainer>{children}</StyledContextMenuContainer>
        </>
      )}
    </StyledButtonDropdown>
  )
}

const StyledButtonDropdown = styled.div`
  .btn-trigger {
    border-left: 1px solid ${({ theme }) => theme.darkPrimaryBorderColor};
  }
`

const CaratDown = styled.span`
  width: 1px;
  height: 1px;
  padding: 0;
  white-space: nowrap;
  border: 0;

  &::after {
    display: inline-block;
    width: 0;
    height: 0;
    vertical-align: 0.255em;
    content: '';
    border-top: 0.3em solid white;
    border-right: 0.3em solid transparent;
    border-bottom: 0;
    border-left: 0.3em solid transparent;
  }
`

export default ButtonDropdown
