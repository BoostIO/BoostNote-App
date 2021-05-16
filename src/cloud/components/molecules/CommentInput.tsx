import React, { useState, useCallback } from 'react'
import Button from '../../../shared/components/atoms/Button'
import styled from '../../../shared/lib/styled'
import Flexbox from '../atoms/Flexbox'

interface CommentInputProps {
  onSubmit: (comment: string) => any
}

export function CommentInput({ onSubmit }: CommentInputProps) {
  const [comment, setComment] = useState('')
  const [working, setWorking] = useState(false)

  const submit = useCallback(
    async (comment: string) => {
      try {
        setWorking(true)
        await onSubmit(comment)
        setComment('')
      } finally {
        setWorking(false)
      }
    },
    [onSubmit]
  )

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = useCallback(
    (ev) => {
      if (ev.key === 'Enter') {
        ev.preventDefault()
        ev.stopPropagation()

        if (ev.shiftKey) {
          setComment((val) => `${val}\n`)
        } else {
          submit(comment)
        }
      }
    },
    [comment, submit]
  )

  const onChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (ev) => {
      setComment(ev.target.value)
    },
    []
  )

  return (
    <InputContainer>
      <textarea
        disabled={working}
        value={comment}
        onChange={onChange}
        onKeyDown={onKeyDown}
      />
      <Flexbox justifyContent='flex-end'>
        <Button disabled={working} onClick={() => submit(comment)}>
          Post
        </Button>
      </Flexbox>
    </InputContainer>
  )
}

const InputContainer = styled.div`
  width: 100%;
  & textarea {
    resize: none;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.border.main};
    height: 60px;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: white;
  }
`

export default CommentInput
