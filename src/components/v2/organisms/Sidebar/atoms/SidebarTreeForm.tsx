import React, { useState, useCallback, useRef } from 'react'
import cc from 'classcat'
import { useEffectOnce } from 'react-use'
import styled from '../../../../../lib/v2/styled'
import Spinner from '../../../atoms/Spinner'
import FormInput from '../../../molecules/Form/atoms/FormInput'

interface SideNavigatorFolderFormProps {
  workspaceId?: string
  parentFolderId?: string
  style?: React.CSSProperties
  depth?: number
  close: () => void
}

const SidebarTreeForm = ({
  depth = 0,
  close,
}: SideNavigatorFolderFormProps) => {
  const [sending, setSending] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const updateName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault()
      setName(event.target.value)
    },
    [setName]
  )

  const onBlur: React.FocusEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault()
    if (sending) {
      return
    }
    close()
  }

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  return (
    <Container depth={depth}>
      <div
        className={cc([sending && 'sending'])}
        onClick={() => setSending(false)}
      >
        <FormInput
          value={name}
          onChange={updateName}
          ref={inputRef}
          onBlur={onBlur}
          disabled={sending}
        />
        {sending && <Spinner className='emphasized spinner' />}
      </div>
    </Container>
  )
}

export default SidebarTreeForm

const Container = styled.form`
  display: block;
  width: 100%;
  position: relative;
  user-select: none;
  height: 32px;
  margin: 2px 0;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;

  .sending {
    cursor: not-allowed;
  }

  .spinner {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
  }

  input {
    width: 100%;
    padding-left: 5px;
    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }
  }
`
