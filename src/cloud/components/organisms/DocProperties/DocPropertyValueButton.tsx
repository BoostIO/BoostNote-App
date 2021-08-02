import React, { forwardRef } from 'react'
import styled from '../../../../shared/lib/styled'
import Spinner from '../../../../shared/components/atoms/Spinner'
import { contextMenuFormItem } from '../../../../shared/lib/styled/styleFunctions'
import cc from 'classcat'
import Icon from '../../../../shared/components/atoms/Icon'

interface DocPropertyValueButtonProps {
  children: React.ReactNode
  iconPath?: string
  disabled?: boolean
  sending?: boolean
  empty?: boolean
  isReadOnly: boolean
  id?: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

const DocPropertyValueButton = forwardRef<
  HTMLButtonElement,
  DocPropertyValueButtonProps
>(
  (
    {
      iconPath,
      sending,
      children,
      disabled,
      empty,
      onClick,
      isReadOnly,
      className,
      id,
    },
    ref
  ) => {
    return (
      <ButtonContainer
        ref={ref}
        disabled={disabled}
        onClick={onClick}
        id={id}
        className={cc([
          'doc__property__button',
          empty && 'doc__property__button--empty',
          isReadOnly && 'doc__property__button--readOnly',
          className,
        ])}
      >
        {sending ? (
          <>
            <Spinner className='button__spinner' /> Sending...
          </>
        ) : (
          <>
            {iconPath != null && (
              <Icon
                path={iconPath}
                size={16}
                className='doc__property__button__icon'
              />
            )}
            <span className='doc__property__button__label'>{children}</span>
          </>
        )}
      </ButtonContainer>
    )
  }
)

export default DocPropertyValueButton

const ButtonContainer = styled.button`
  display: flex;
  width: fit-content;
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

  .doc__property__button__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  &.doc__property__button--readOnly {
    cursor: not-allowed;
    &:hover {
      background: none !important;
    }
  }

  &.doc__property__button--empty {
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .button__spinner {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    border-color: ${({ theme }) => theme.colors.variants.primary.text};
    border-right-color: transparent;
  }

  &:not(.button__state--disabled) {
    &:hover,
    &:active,
    &:focus,
    &.button__state--active {
      background: ${({ theme }) =>
        theme.colors.background.secondary} !important;
      color: ${({ theme }) => theme.colors.text.primary};

      .doc__property__button__icon {
        color: ${({ theme }) => theme.colors.text.primary};
      }
    }
  }
`
