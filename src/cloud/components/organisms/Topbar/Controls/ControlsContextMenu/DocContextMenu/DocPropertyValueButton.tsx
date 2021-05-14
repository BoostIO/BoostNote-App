import React, { forwardRef } from 'react'
import styled from '../../../../../../../shared/lib/styled'
import Spinner from '../../../../../../../shared/components/atoms/Spinner'

interface DocPropertyValueButtonProps {
  children: React.ReactNode
  disabled?: boolean
  sending?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const DocPropertyValueButton = forwardRef<
  HTMLButtonElement,
  DocPropertyValueButtonProps
>(({ sending, children, disabled, onClick }, ref) => {
  return (
    <ButtonContainer ref={ref} disabled={disabled} onClick={onClick}>
      {sending != null ? (
        children
      ) : (
        <>
          <Spinner className='button__spinner' /> Sending...
        </>
      )}
    </ButtonContainer>
  )
})

export default DocPropertyValueButton

const ButtonContainer = styled.button`
  display: flex;
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: left;
  align-items: center;
  padding: 0 10px;
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  outline: none;
  border-radius: 4px;
  border-color: transparent;
  border-width: 1px;
  border-style: solid;
  background: none;
  color: inherit;
  box-sizing: border-box;
  transition: 200ms background-color;

  background: none;
  border: 1px solid transparent;
  color: ${({ theme }) => theme.colors.text.subtle};
  padding: 0 3px !important;

  &:focus {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.variants.info.base};
  }
  .button__spinner {
    border-color: ${({ theme }) => theme.colors.variants.primary.text};
    border-right-color: transparent;
  }

  &:not(.button__state--disabled) {
    &:hover,
    &:active,
    &:focus,
    &.button__state--active {
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`
