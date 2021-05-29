import React, { forwardRef } from 'react'
import styled from '../../../../../../../shared/lib/styled'
import Spinner from '../../../../../../../shared/components/atoms/Spinner'
import { contextMenuFormItem } from '../../../../../../../shared/lib/styled/styleFunctions'
import cc from 'classcat'

interface DocPropertyValueButtonProps {
  children: React.ReactNode
  disabled?: boolean
  sending?: boolean
  empty?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const DocPropertyValueButton = forwardRef<
  HTMLButtonElement,
  DocPropertyValueButtonProps
>(({ sending, children, disabled, empty, onClick }, ref) => {
  return (
    <ButtonContainer
      ref={ref}
      disabled={disabled}
      onClick={onClick}
      className={cc([empty && 'doc__property__button--empty'])}
    >
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
  height: 32px;
  display: flex;
  justify-content: left;
  align-items: center;
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
  color: ${({ theme }) => theme.colors.text.primary};
  ${({ theme }) => contextMenuFormItem({ theme }, ':focus')}

  &.doc__property__button--empty {
    color: ${({ theme }) => theme.colors.text.subtle};
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
