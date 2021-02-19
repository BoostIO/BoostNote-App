import React, { useRef, useState, useCallback } from 'react'
import styled from '../../../../../lib/styled'
import { inputStyle } from '../../../../../lib/styled/styleFunctions'
import { useEffectOnce } from 'react-use'
import { ModalContainer } from '../styled'
import { useModal } from '../../../../../lib/stores/modal'

interface SingleInputModalProps {
  content?: React.ReactNode
  onSubmit: (val: string) => void
}

const SingleInputModal = ({ content, onSubmit }: SingleInputModalProps) => {
  const { closeModal } = useModal()
  const [value, setValue] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  const updateValue = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      setValue(event.target.value)
    },
    [setValue]
  )

  const onSubmitForm = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault()
      onSubmit(value)
      closeModal()
    },
    [onSubmit, value, closeModal]
  )

  return (
    <ModalContainer>
      <StyledSideNavigatorFolderForm onSubmit={onSubmitForm}>
        {content}
        <StyledInput value={value} onChange={updateValue} ref={inputRef} />
      </StyledSideNavigatorFolderForm>
    </ModalContainer>
  )
}

export default SingleInputModal

const StyledSideNavigatorFolderForm = styled.form`
  display: block;
  width: 100%;
  position: relative;
  user-select: none;
  height: auto;
  margin: 2px 0;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  margin-bottom: ${({ theme }) => theme.space.small}px;
`

const StyledInput = styled.input`
  ${inputStyle}
  width: 100%;
  padding-left: 5px;
  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
`
