import React from 'react'
import styled from '../../../lib/v2/styled'
import { AppComponent } from '../../../lib/v2/types'
import cc from 'classcat'
import Icon from '../atoms/Icon'
import Spinner from '../atoms/Spinner'
import UpDownList from '../atoms/UpDownList'

interface MetadataContainerProps {
  rows: MetadataContainerRow[]
}

export type MetadataContainerRow = (
  | {
      type: 'button'
      spinning?: boolean
      disabled?: boolean
      onClick: () => void
      label: {
        text: string
        icon?: string
        tooltip?: { label: string; text: React.ReactNode }
      }
    }
  | {
      type: 'content'
      direction?: 'row' | 'column'
      content?: React.ReactNode
    }
) & {
  icon?: string
  label?: {
    text: string
    icon?: string
    tooltip?: { label: string; text: React.ReactNode }
  }
  breakAfter?: boolean
}

const MetadataContainer: AppComponent<MetadataContainerProps> = ({ rows }) => (
  <UpDownList>
    <Container className='metadata'>
      <div className='metadata__container'>
        <div className='metadata__scroll'>
          <div className='metadata__scroll__wrapper'>
            {rows.map((row, i) => (
              <React.Fragment key={`metadata__item${i}`}>
                {row.type === 'button' ? (
                  <button
                    className={cc(['metadata__item', 'metadata__button'])}
                    onClick={row.onClick}
                    disabled={row.disabled}
                    id={`metadata-${i}-${row.label.text}`}
                  >
                    {row.spinning ? (
                      <Spinner />
                    ) : (
                      <>
                        {row.label.icon != null && (
                          <Icon
                            path={row.label.icon}
                            className='metadata__icon'
                          />
                        )}
                        {row.label.text}
                      </>
                    )}
                  </button>
                ) : (
                  <div
                    className={cc([
                      'metadata__item',
                      `metadata__item--${row.direction || 'row'}`,
                    ])}
                  >
                    {row.label != null && (
                      <label className='metadata__label'>
                        {row.icon != null && (
                          <Icon path={row.icon} className='metadata__icon' />
                        )}
                        {row.label.text}
                        {row.label.tooltip && (
                          <div className='context__tooltip'>
                            <div className='context__tooltip__text'>
                              {row.label.tooltip.text}
                            </div>
                            {row.label.tooltip.label}
                          </div>
                        )}
                      </label>
                    )}
                    <div className='metadata__content'>{row.content}</div>
                  </div>
                )}
                {row.breakAfter && <div className='metadata__break' />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </Container>
  </UpDownList>
)

const containerWidth = 350
const Container = styled.div`
  width: ${containerWidth}px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  border-left: 1px solid transparent;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .metadata__container {
    position: relative;
    width: 100%;
    height: 100%;
  }

  .metadata__scroll {
    height: 100%;
    overflow: auto;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    scrollbar-width: thin;
    &::-webkit-scrollbar {
      width: 6px;
    }
  }

  .metadata__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
    flex: 0 0 auto;
  }

  .metadata__scroll__wrapper {
    flex: 1 1 auto;
    width: 100%;
    overflow: hidden auto;
  }

  .metadata__break {
    display: block;
    height: 1px;
    margin: 0px ${({ theme }) => theme.sizes.spaces.sm}px;
    background-color: ${({ theme }) => theme.colors.background.quaternary};
  }

  .metadata__content {
    line-height: inherit;
    min-height: 30px;
  }

  .metadata__item,
  .metadata__item--column {
    position: relative;
    display: flex;
    align-items: flex-start;
    line-height: 30px;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
    padding: 0px ${({ theme }) => theme.sizes.spaces.sm}px;
    height: fit-content;
  }

  .metadata__item--column {
    flex-direction: column;
  }

  .metadata__item--column + .metadata__break,
  .metadata__item + .metadata__break {
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .metadata__item + .metadata__item,
  .metadata__break + .metadata__item,
  .metadata__item--column + .metadata__item--column,
  .metadata__break + .metadata__item--column {
    padding-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
    padding-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
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

    &:hover {
      background-color: ${({ theme }) => theme.colors.background.secondary};
    }
    &:focus {
      background-color: ${({ theme }) => theme.colors.background.tertiary};
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
`

export default MetadataContainer
