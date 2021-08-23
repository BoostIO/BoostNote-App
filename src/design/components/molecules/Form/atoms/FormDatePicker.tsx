import React from 'react'
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker'
import FormInput from './FormInput'

export type FormDatePickerProps = ReactDatePickerProps

const FormDatePicker = React.forwardRef<HTMLInputElement, FormDatePickerProps>(
  ({ className, id, onChange, ...datePickerProps }, ref) => {
    return (
      <ReactDatePicker
        {...datePickerProps}
        onChange={onChange}
        className='form__date__picker'
        customInput={
          <FormInput
            className={className}
            id={id}
            ref={ref}
            autoComplete='off'
          />
        }
      />
    )
  }
)

export default FormDatePicker
