import React, { PropsWithChildren } from 'react'
import cc from 'classcat'
import styled from '../../lib/styled'
import FormInput from './Form/atoms/FormInput'
import Form from './Form'
import { useI18n } from '../../../cloud/lib/hooks/useI18n'
import UpDownList from '../atoms/UpDownList'
import FormRowItem from './Form/templates/FormRowItem'
import { lngKeys } from '../../../cloud/lib/i18n/types'
import Scroller from '../atoms/Scroller'
import Checkbox from './Form/atoms/FormCheckbox'
import Button from '../atoms/Button'
import { overflowEllipsis } from '../../lib/styled/styleFunctions'

export interface SearchableListOption {
  icon?: React.ReactNode
  label: string | React.ReactNode
  checked?: boolean
  onClick: () => void
}

export interface SearchableOptionListProps {
  title?: string
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
  prefix?: string
  options: SearchableListOption[]
  hideSubmit?: boolean
  onSubmit?: () => void
  onCancel?: () => void
}

const SearchableOptionList = React.forwardRef<
  HTMLInputElement,
  PropsWithChildren<SearchableOptionListProps & { className?: string }>
>(
  (
    {
      title,
      query,
      setQuery,
      className,
      children,
      prefix = 'searchable',
      options,
      onSubmit,
      onCancel,
    },
    inputRef
  ) => {
    const { translate } = useI18n()
    return (
      <SearchableListContainer
        className={cc(['searchable__list', prefix, className])}
        prefix={prefix}
      >
        {title != null && <h3>{title}</h3>}
        <Form
          onSubmit={(event) => {
            event.preventDefault()
            if (onSubmit != null) {
              onSubmit()
            }
          }}
          onCancel={onCancel}
          className='searchable__list__form'
        >
          <UpDownList ignoreFocus={true}>
            <FormRowItem>
              <FormInput
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={translate(lngKeys.GeneralSearchVerb)}
                id='searchable__list__input'
              />
            </FormRowItem>
            <Scroller className='searchable__list__wrapper'>
              {options.map((option, i) => {
                return (
                  <div className='searchable__list__item' key={`${i}`}>
                    <button
                      className='searchable__list__item__wrapper'
                      onClick={option.onClick}
                      id={`searchable__list__item${i}`}
                      tabIndex={0}
                      type='button'
                    >
                      {option.icon}
                      <span className='searchable__list__item__label'>
                        {option.label}
                      </span>
                      {option.checked != null && (
                        <Checkbox
                          checked={option.checked}
                          className='searchable__list__item__checkbox'
                        />
                      )}
                    </button>
                  </div>
                )
              })}
              {children}
            </Scroller>
            <div className='searchable__list__break' />
            {onSubmit != null && (
              <Button
                type='submit'
                variant='transparent'
                className='searchable__list__submit'
                id='searchable__list__submit'
                size='sm'
              >
                {translate(lngKeys.GeneralSaveVerb)}
              </Button>
            )}
          </UpDownList>
        </Form>
      </SearchableListContainer>
    )
  }
)

const SearchableListContainer = styled.div`
  .searchable__list__item {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  #searchable__list__input {
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .searchable__list__break {
    display: block;
    height: 1px;
    width: 100%;
    background: ${({ theme }) => theme.colors.border.second};
    flex: 0 0 auto;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .searchable__list__submit {
    display: flex;
    width: 100%;
  }

  .searchable__list__wrapper {
    min-height: 30px;
    max-height: 250px;
  }

  .searchable__list__item__wrapper {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    width: 100%;
    height: 30px;
    cursor: pointer;
    background: none;
    transition: background 200ms;
    color: ${({ theme }) => theme.colors.text.primary};
    justify-content: space-between;
    text-align: left;
    border-radius: ${({ theme }) => theme.borders.radius}px;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px
      ${({ theme }) => theme.sizes.spaces.sm}px;

    &:focus {
      background: ${({ theme }) => theme.colors.background.tertiary};
    }

    &:hover {
      background: ${({ theme }) => theme.colors.background.secondary};
    }

    .searchable__list__item__label {
      flex: 1 1 auto;
      ${overflowEllipsis}
    }

    .searchable__list__item__checkbox {
      margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
      pointer-events: none;
    }

    .searchable__list__item__wrapper > *:not(.searchable__list__item__label) {
      flex: 0 0 auto;
      flex-shrink: 0;
    }
  }
`

export default React.memo(SearchableOptionList)
