import React, { useState, useRef, useEffect, useCallback } from 'react'
import FormInput from './FormInput'
import Spinner from '../../../atoms/Spinner'
import Button, { ButtonVariant } from '../../../atoms/Button'
import cc from 'classcat'

type FormToggableInputProps = {
  className?: string
  variant?: ButtonVariant
  label: string
  labelAsDefaultInputValue?: boolean
  iconPath?: string
  submit: (val: string) => Promise<void>
}

const FormToggableInput = ({
  className,
  variant = 'transparent',
  iconPath,
  label,
  labelAsDefaultInputValue = false,
  submit,
}: FormToggableInputProps) => {
  const [formState, setFormState] = useState<'idle' | 'editing' | 'submitting'>(
    'idle'
  )
  const [value, setValue] = useState('')
  const compositionStateRef = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current != null && formState === 'editing') {
      inputRef.current.focus()
    }
  }, [formState])

  const cancelEditing = useCallback(() => {
    setFormState('idle')
    setValue('')
  }, [])

  const submitValue = useCallback(
    async (value: string) => {
      setFormState('submitting')
      await submit(value)
      setValue('')
      setFormState('idle')
    },
    [submit]
  )

  return (
    <div className={cc(['form__toggable__input', className])}>
      {formState === 'idle' ? (
        <Button
          className='form__toggable__input__button'
          onClick={() => {
            if (labelAsDefaultInputValue) {
              setValue(label)
            }
            setFormState('editing')
          }}
          variant={variant}
          iconPath={iconPath}
        >
          {label}
        </Button>
      ) : formState === 'editing' ? (
        <FormInput
          ref={inputRef}
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          onCompositionStart={() => {
            compositionStateRef.current = true
          }}
          onCompositionEnd={() => {
            compositionStateRef.current = false
            if (inputRef.current != null) {
              inputRef.current.focus()
            }
          }}
          onKeyPress={(event) => {
            if (compositionStateRef.current) {
              return
            }
            switch (event.key) {
              case 'Escape':
                event.preventDefault()
                cancelEditing()
                return
              case 'Enter':
                event.preventDefault()
                submitValue(value)
                return
            }
          }}
          onBlur={cancelEditing}
        />
      ) : (
        <Spinner />
      )}
    </div>
  )
}

export default FormToggableInput
