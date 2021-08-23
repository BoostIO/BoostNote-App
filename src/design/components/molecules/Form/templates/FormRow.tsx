import React from 'react'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'
import cc from 'classcat'
import FormRowItem, { FormItemProps } from './FormRowItem'

export type FormRowProps = {
  layout?: 'column' | 'split'
  title?: React.ReactNode
  required?: boolean
  description?: React.ReactNode
  items?: FormItemProps[]
}

const FormRow: AppComponent<{ row?: FormRowProps; fullWidth?: boolean }> = ({
  row = { required: false, title: null, items: [] },
  className,
  children,
  fullWidth,
}) => {
  const items = row.items || []
  return (
    <Container
      className={cc([
        'form__row',
        row.required && 'form__row--required',
        className,
      ])}
    >
      {row.title != null && <div className='form__row__title'>{row.title}</div>}
      <div
        className={cc([
          'form__row__items',
          !fullWidth && items.length <= 1 && 'form__row__items--single-item',
        ])}
      >
        {items.map((item, k) => (
          <FormRowItem item={item} key={`form__row__${k}`} />
        ))}
        {children}
      </div>
      {row.description != null && (
        <div className='form__row__description'>{row.description}</div>
      )}
    </Container>
  )
}

const Container = styled.div`
  .form__row__description {
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  &.form__row--required .form__row__title::after {
    content: '*';
    color: ${({ theme }) => theme.colors.variants.danger.base};
    filter: brightness(160%);
    position: absolute;
    right: -5px;
    top: -3px;
  }

  .form__row__title {
    display: inline-block;
    position: relative;
    filter: brightness(80%);
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .form__row__items {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
    justify-content: space-between;
  }

  .form__row__items--single-item {
    max-width: 450px;
  }

  .form__row__item + .form__row__item {
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`

export default FormRow
