import React, { useState } from 'react'
import copy from 'copy-to-clipboard'
import styled from '../../../../lib/styled'
import { AppComponent } from '../../../../lib/types'
import cc from 'classcat'
import FormInput from './FormInput'
import Button from '../../../atoms/Button'

interface FormCopyInputProps {
  text: string
  copyLabel?: string
}

const FormCopyInput: AppComponent<FormCopyInputProps> = ({
  text,
  className,
  copyLabel = 'Copy',
}) => {
  const [copyButtonLabel, setCopyButtonLabel] = useState<string>(copyLabel)

  const copyButtonHandler = () => {
    copy(text)
    setCopyButtonLabel('✓ Copied')
    setTimeout(() => {
      setCopyButtonLabel(copyLabel)
    }, 600)
  }

  return (
    <Container className={cc(['form__copy', className])}>
      <FormInput readOnly={true} className='form__copy__input' value={text} />
      <Button
        variant='primary'
        className='form__copy__button'
        onClick={copyButtonHandler}
        tabIndex={0}
      >
        {copyButtonLabel}
      </Button>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  .form__copy__input {
    flex: 1 1 auto;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }

  .form__copy__button {
    width: 100px;
    white-space: nowrap;
    flex: 0 0 auto;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
`

export default FormCopyInput
