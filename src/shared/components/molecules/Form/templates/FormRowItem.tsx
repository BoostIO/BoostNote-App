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

type FormItemExpandOptions = 'shrink' | 'grow'
export type FormItemProps =
  | {
      type: 'input'
      expand?: FormItemExpandOptions
      props: FormInputProps & { ref?: React.Ref<HTMLInputElement> }
    }
  | {
      type: 'textarea'
      expand?: FormItemExpandOptions
      props: FormTextareaProps & { ref?: React.Ref<HTMLTextAreaElement> }
    }
  | { type: 'select'; expand?: FormItemExpandOptions; props: FormSelectProps }
  | {
      type: 'select--string'
      expand?: FormItemExpandOptions
      props: SimpleFormSelectProps
    }
  | { type: 'emoji'; expand?: FormItemExpandOptions; props: FormEmojiProps }
  | {
      type: 'button'
      expand?: FormItemExpandOptions
      props: FormRowButtonProps
    }
  | { type: 'image'; expand?: FormItemExpandOptions; props: FormImageProps }
  | { type: 'node'; expand?: FormItemExpandOptions; element: React.ReactNode }

const FormRowItem: AppComponent<{
  item?: FormItemProps
  expand?: FormItemExpandOptions
}> = ({ item, className, children, expand }) => {
  return (
    <Container
      className={cc([
        `form__row__item`,
        `form__row__item--${item?.type || 'node'}`,
        expand != null
          ? `form__row__item--${expand}`
          : `form__row__item--${item?.expand || 'grow'}`,
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

  &.form__row__item.form__row__item--shrink {
    flex: 0 1 0%;
  }

  &.form__row__item:not(.form__row__item--shrink):not(.form__row__item--emoji):not(.form__row__item--button),
  &.form__row__item:not(.form__row__item--shrink):not(.form__row__item--emoji):not(.form__row__item--button)
    > * {
    flex: 1 1 auto;
  }
`

export default FormRowItem
