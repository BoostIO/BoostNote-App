import React from 'react'
import { AppComponent } from '../../../../lib/types'
import Icon from '../../../atoms/Icon'
import Spinner from '../../../atoms/Spinner'
import cc from 'classcat'
import styled from '../../../../lib/styled'
import MetadataContainerBreak from '../atoms/MetadataContainerBreak'
import Button, { ButtonProps } from '../../../atoms/Button'

export type MetadataContainerRowProps = (
  | {
      type: 'button'
      props: ButtonProps & { spinning?: boolean; label: string }
    }
  | {
      type: 'content'
      direction?: 'row' | 'column'
      content?: React.ReactNode
      icon?: string
      label: string
    }
  | { type: 'header'; content: React.ReactNode }
) & {
  breakAfter?: boolean
}

interface MetadataRowProps {
  row: MetadataContainerRowProps
}

const MetadataContainerRow: AppComponent<MetadataRowProps> = ({
  className,
  children,
  row,
}) => {
  return (
    <>
      <Container className={cc(['metadata__item', className])}>
        {row.type === 'button' ? (
          <Button
            variant='transparent'
            className={cc([
              'metadata__item__wrapper',
              'metadata__button',
              row.props.spinning && 'metadata__button--spinning',
            ])}
            onClick={row.props.onClick}
            disabled={row.props.disabled}
            id={row.props.id}
          >
            {row.props.spinning ? (
              <Spinner className='metadata__spinner' />
            ) : (
              <>
                {row.props.iconPath != null && (
                  <Icon
                    path={row.props.iconPath}
                    size={16}
                    className='metadata__icon'
                  />
                )}
                {row.props.label}
              </>
            )}
          </Button>
        ) : row.type === 'header' ? (
          <div className='metadata__item__header'>{row.content}</div>
        ) : (
          <div
            className={cc([
              'metadata__item__wrapper',
              `metadata__item--${row.direction || 'row'}`,
            ])}
          >
            {row.label != null && (
              <label className='metadata__label'>
                {row.icon != null && (
                  <Icon path={row.icon} className='metadata__icon' />
                )}
                {row.label}
              </label>
            )}
            <div className='metadata__content'>{row.content}</div>
          </div>
        )}
        {children}
      </Container>
      {row.breakAfter && <MetadataContainerBreak />}
    </>
  )
}

const Container = styled.div`
  .metadata__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .metadata__spinner {
    border-left-color: ${({ theme }) => theme.colors.text.subtle};
    border-top-color: ${({ theme }) => theme.colors.text.subtle};
    border-bottom-color: ${({ theme }) => theme.colors.text.subtle};
  }

  .metadata__content {
    line-height: inherit;
    min-height: 30px;
    flex: 1 1 auto;
    display: block;
    overflow: hidden;
  }

  &.metadata__item {
    width: 100%;
    position: relative;
    display: flex;
    align-items: flex-start;
    line-height: 30px;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    padding: 0px ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .metadata__item__wrapper {
    width: 100%;
    position: relative;
    display: flex;
    align-items: flex-start;
    height: fit-content;
    flex: 1 1 auto;
  }

  .metadata__item--column {
    flex-direction: column;
  }

  .metadata__label {
    display: flex;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.primary};
    width: 120px;
    flex: 0 0 auto;
    margin-bottom: 0;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
    cursor: inherit;
  }

  .metadata__button {
    width: 100%;
    text-align: left;
  }

  .metadata__button {
    display: flex;
    align-items: center;
    background: none;
    outline: none;
    border: 0;
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    text-align: left;
    line-height: inherit;
    justify-content: flex-start;
    height: 30px;

    &.metadata__button--spinning {
      justify-content: center;
    }

    &:hover {
      background: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:disabled {
      color: ${({ theme }) => theme.colors.text.subtle};

      &:hover,
      &:focus {
        color: ${({ theme }) => theme.colors.text.subtle} !important;
        background-color: transparent;
        cursor: not-allowed;
      }
    }
  }

  .metadata__item__header {
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text.subtle} !important;
  }
`

export default MetadataContainerRow
