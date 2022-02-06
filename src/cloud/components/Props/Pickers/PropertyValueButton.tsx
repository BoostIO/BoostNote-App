import React, { forwardRef } from 'react'
import styled from '../../../../design/lib/styled'
import Spinner from '../../../../design/components/atoms/Spinner'
import {
  contextMenuFormItem,
  overflowEllipsis,
  StyledProps,
} from '../../../../design/lib/styled/styleFunctions'
import cc from 'classcat'
import Icon from '../../../../design/components/atoms/Icon'

interface PropertyValueButtonProps {
  children?: React.ReactNode
  iconPath?: string
  disabled?: boolean
  sending?: boolean
  empty?: boolean
  isReadOnly: boolean
  isErrored?: boolean
  id?: string
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  tag?: 'button' | 'div'
}

const PropertyValueButton = forwardRef<
  HTMLButtonElement,
  PropertyValueButtonProps
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
      isErrored,
      className,
      id,
      tag = 'button',
    },
    ref
  ) => {
    if (tag === 'div') {
      return (
        <DivContainer
          id={id}
          className={cc([
            'item__property__button',
            empty && 'item__property__button--empty',
            isReadOnly && 'item__property__button--readOnly',
            isErrored && 'item__property__button--errored',
            className,
          ])}
          onClick={onClick}
        >
          {sending ? (
            <>
              <Spinner className='button__spinner' /> Sending...
            </>
          ) : (
            <>
              {iconPath != null && !empty && (
                <Icon
                  path={iconPath}
                  size={16}
                  className='item__property__button__icon'
                />
              )}
              <span className='item__property__button__label'>
                {empty ? 'Empty' : children}
              </span>
            </>
          )}
        </DivContainer>
      )
    }

    return (
      <ButtonContainer
        ref={ref}
        disabled={disabled}
        onClick={onClick}
        id={id}
        className={cc([
          'item__property__button',
          empty && 'item__property__button--empty',
          isReadOnly && 'item__property__button--readOnly',
          isErrored && 'item__property__button--errored',
          className,
        ])}
      >
        {sending ? (
          <>
            <Spinner className='button__spinner' /> Sending...
          </>
        ) : (
          <>
            {iconPath != null && !empty && (
              <Icon
                path={iconPath}
                size={16}
                className='item__property__button__icon'
              />
            )}
            <span className='item__property__button__label'>
              {empty ? 'Empty' : children}
            </span>
          </>
        )}
      </ButtonContainer>
    )
  }
)

export default PropertyValueButton

const ValueButtonStyle = ({ theme }: StyledProps) => `
display: flex;
width: fit-content;
height: 32px;
display: flex;
justify-content: left;
align-items: center;
font-size: ${theme.sizes.fonts.df}px;
outline: none;
border-radius: 4px;
border-color: transparent;
border-width: 1px;
border-style: solid;
background: none;
color: inherit;
box-sizing: border-box;
transition: 200ms background-color;
color: ${theme.colors.text.primary};
${contextMenuFormItem({ theme }, ':focus')}

.item__property__button__icon {
  margin-right: ${theme.sizes.spaces.xsm}px;
  color: ${theme.colors.text.subtle};
  flex-shrink: 0;
}

.item__property__button__label {
  text-align: left;
  ${overflowEllipsis()}
}

&.item__property__button--readOnly {
  cursor: not-allowed;
  &:hover {
    background: none !important;
  }
}

&.item__property__button--empty {
  color: ${theme.colors.text.subtle};
}

.button__spinner {
  margin-right: ${theme.sizes.spaces.xsm}px;
  border-color: ${theme.colors.variants.primary.text};
  border-right-color: transparent;
}

&:not(.button__state--disabled) {
  &:hover,
  &:active,
  &:focus,
  &.button__state--active {
    background: ${theme.colors.background.secondary} !important;
    color: ${theme.colors.text.primary};

    .item__property__button__icon {
      color: ${theme.colors.text.primary};
    }
  }
}

&.item__property__button--errored {
  background-color: rgba(100, 4, 4, 0.2) !important;

  &:hover {
    background-color: rgba(100, 4, 4, 0.2) !important;
  }
}
`

const DivContainer = styled.div`
  ${(theme) => ValueButtonStyle(theme)}
`

const ButtonContainer = styled.button`
  ${(theme) => ValueButtonStyle(theme)}
`
