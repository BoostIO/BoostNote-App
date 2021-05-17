import React, { useState } from 'react'
import styled from '../../../lib/styled'
import { LoadingButton, ButtonProps } from '../../atoms/Button'
import FormInput, { FormInputProps } from './atoms/FormInput'
import FormSelect, {
  FormSelectProps,
  SimpleFormSelect,
  SimpleFormSelectProps,
} from './atoms/FormSelect'
import cc from 'classcat'
import { AppComponent } from '../../../lib/types'
import FormEmoji, { FormEmojiProps } from './atoms/FormEmoji'

interface FormProps {
  rows: FormRowProps[]
  onSubmit?: React.FormEventHandler
  submitButton?: LabelButtonProps
  onCancel?: () => void
}

type LabelButtonProps = ButtonProps & {
  label: React.ReactNode
  spinning?: boolean
}

export type FormRowProps = {
  layout?: 'column' | 'split'
  title?: React.ReactNode
  description?: React.ReactNode
  items?: (
    | {
        type: 'input'
        props: FormInputProps & { ref?: React.Ref<HTMLInputElement> }
      }
    | { type: 'select'; props: FormSelectProps }
    | { type: 'select--string'; props: SimpleFormSelectProps }
    | { type: 'emoji'; props: FormEmojiProps }
    | { type: 'button'; props: LabelButtonProps }
    | { type: 'node'; element: React.ReactNode }
  )[]
}

const Form: AppComponent<FormProps> = ({
  onSubmit,
  rows,
  submitButton,
  children,
  className,
}) => {
  const [submitState, setSubmitState] = useState(false)
  return (
    <Container
      onSubmit={async (event: React.FormEvent) => {
        if (onSubmit == null) {
          return
        }

        event.preventDefault()
        setSubmitState(true)
        new Promise(() => onSubmit(event)).finally(() => setSubmitState(false))
      }}
      className={cc(['form', className])}
    >
      {rows.map((row, i) => {
        return (
          <div className='form__row' key={`row--${i}`}>
            {row.title != null && (
              <div className='form__row__title'>{row.title}</div>
            )}
            {row.items != null && (
              <div className='form__row__items'>
                {row.items.map((item, k) => (
                  <div
                    className={`form__row__item form__row__item--${item.type}`}
                    key={`form__row__item--${i}-${k}`}
                  >
                    {item.type === 'input' ? (
                      <FormInput {...item.props} />
                    ) : item.type === 'select' ? (
                      <FormSelect {...item.props} />
                    ) : item.type === 'select--string' ? (
                      <SimpleFormSelect {...item.props} />
                    ) : item.type === 'emoji' ? (
                      <FormEmoji {...item.props} />
                    ) : item.type === 'button' ? (
                      <LoadingButton {...item.props}>
                        {item.props.label}
                      </LoadingButton>
                    ) : (
                      item.element
                    )}
                  </div>
                ))}
              </div>
            )}
            {row.description != null && (
              <div className='form__row__description'>{row.description}</div>
            )}
          </div>
        )
      })}
      {children}
      {submitButton != null && (
        <div className='form__row'>
          <LoadingButton
            {...submitButton}
            spinning={submitState || submitButton.spinning}
            variant='primary'
            type='submit'
          >
            {submitButton.label}
          </LoadingButton>
        </div>
      )}
    </Container>
  )
}

export default Form

const Container = styled.form`
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;

  .form__row__description {
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .form__row + .form__row {
    margin-top: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  .form__row__items {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
    justify-content: space-between;
  }

  .form__row__item {
    display: flex;
    align-items: stretch;
  }

  .form__row__item--emoji,
  .form__row__item--button {
    flex: 0 0 auto;
  }

  .form__row__item:not(.form__row__item--emoji):not(.form__row__item--button),
  .form__row__item:not(.form__row__item--emoji):not(.form__row__item--button)
    > * {
    flex: 1 1 auto;
  }

  .form__row__item + .form__row__item {
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
  }
`
