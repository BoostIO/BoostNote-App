import React from 'react'
import { ButtonProps, LoadingButton } from '../../../atoms/Button'
import FormEmoji, { FormEmojiProps } from '../atoms/FormEmoji'
import FormImage, { FormImageProps } from '../atoms/FormImage'
import FormInput, { FormInputProps } from '../atoms/FormInput'
import FormSelect, {
  FormSelectProps,
  SimpleFormSelect,
  SimpleFormSelectProps,
} from '../atoms/FormSelect'
import FormTextarea, { FormTextareaProps } from '../atoms/FormTextArea'
import cc from 'classcat'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'

export type FormRowButtonProps = ButtonProps & {
  label: React.ReactNode
  spinning?: boolean
}

export type FormItemProps =
  | {
      type: 'input'
      props: FormInputProps & { ref?: React.Ref<HTMLInputElement> }
    }
  | {
      type: 'textarea'
      props: FormTextareaProps & { ref?: React.Ref<HTMLTextAreaElement> }
    }
  | { type: 'select'; props: FormSelectProps }
  | {
      type: 'select--string'
      props: SimpleFormSelectProps
    }
  | { type: 'emoji'; props: FormEmojiProps }
  | {
      type: 'button'
      props: FormRowButtonProps
    }
  | { type: 'image'; props: FormImageProps }
  | { type: 'node'; element: React.ReactNode }

const FormRowItem: AppComponent<{
  item?: FormItemProps
}> = ({ item, className, children }) => {
  return (
    <Container
      className={cc([
        `form__row__item`,
        `form__row__item--${item?.type || 'node'}`,
        className,
      ])}
    >
      {item != null ? (
        item.type === 'input' ? (
          <FormInput {...item.props} />
        ) : item.type === 'select' ? (
          <FormSelect {...item.props} />
        ) : item.type === 'select--string' ? (
          <SimpleFormSelect {...item.props} />
        ) : item.type === 'textarea' ? (
          <FormTextarea {...item.props} />
        ) : item.type === 'image' ? (
          <FormImage {...item.props} />
        ) : item.type === 'emoji' ? (
          <FormEmoji {...item.props} />
        ) : item.type === 'button' ? (
          <LoadingButton {...item.props}>{item.props.label}</LoadingButton>
        ) : (
          item.element
        )
      ) : null}
      {children}
    </Container>
  )
}

const Container = styled.div`
  &.form__row__item {
    display: flex;
    align-items: stretch;
  }

  &.form__row__item--emoji,
  &.form__row__item--button {
    flex: 0 0 auto;
  }

  &.form__row__item:not(.form__row__item--emoji):not(.form__row__item--button),
  &.form__row__item:not(.form__row__item--emoji):not(.form__row__item--button)
    > * {
    flex: 1 1 auto;
  }
`

export default FormRowItem
