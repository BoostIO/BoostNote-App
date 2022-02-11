import React, { useState } from 'react'
import { HexColorPicker } from 'react-colorful'
import { ColorPickerBaseProps } from 'react-colorful/dist/types'
import styled from '../../../../lib/styled'
import FormInput, { FormInputProps } from './FormInput'

type FormColorSelectProps = Omit<FormInputProps, 'onChange'> & {
  onChange: ColorPickerBaseProps<string>['onChange']
}

const FormColorSelect = ({
  onChange,
  value,
  ...rest
}: FormColorSelectProps) => {
  const [open, setOpen] = useState(false)
  return (
    <Container>
      <FormInput
        {...rest}
        readOnly={true}
        value={value}
        onClick={() => setOpen((isOpen) => !isOpen)}
      />
      {open && (
        <div className='form__color__selector'>
          <HexColorPicker color={value} onChange={onChange} />
        </div>
      )}
    </Container>
  )
}

const Container = styled.div`
  display: inline-block;
  position: relative;
  width: 100%;

  & > .form__color__selector {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
    transform: translate3d(0, -105%, 0);

    .react-colorful {
      width: auto;
    }
  }
`

export default FormColorSelect
