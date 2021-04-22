import React, { useState, useCallback, useRef } from 'react'
import cc from 'classcat'
import { useEffectOnce } from 'react-use'
import styled from '../../../../lib/styled'
import Spinner from '../../../atoms/Spinner'
import FormInput from '../../../molecules/Form/atoms/FormInput'

interface SideNavigatorFolderFormProps {
  placeholder?: string
  createCallback: ((val: string) => Promise<void>) | null
  depth?: number
  close: () => void
}

const SidebarTreeForm = ({
  depth = 0,
  placeholder,
  close,
  createCallback,
}: SideNavigatorFolderFormProps) => {
  const [sending, setSending] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

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

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      if (name.trim() === '' || createCallback == null) {
        close()
        return
      }

      setSending(true)
      await createCallback(name.trim())
      close()
    },
    [name, close, createCallback]
  )

  return (
    <Container depth={depth} onSubmit={submit}>
      <div
        className={cc([
          'sidebar__tree__form',
          sending && 'sidebar__tree__form--sending',
        ])}
        onClick={() => setSending(false)}
      >
        <FormInput
          className='sidebar__tree__form__input'
          value={name}
          onChange={updateName}
          ref={inputRef}
          onBlur={onBlur}
          disabled={sending}
          placeholder={placeholder}
        />
        {sending && <Spinner className='sidebar__tree__form__spinner' />}
      </div>
    </Container>
  )
}

export default SidebarTreeForm

const Container = styled.form<{ depth: number }>`
  display: flex;
  flex: 1 1 auto;
  position: relative;
  user-select: none;
  margin: 2px 0;
  border-top: 1px solid transparent;
  border-bottom: 1px solid transparent;
  margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;

  .sidebar__tree__form {
    padding-left: ${({ depth }) => 26 + (depth as number) * 20}px;
    display: flex;
    flex: 1 1 auto;
    align-items: center;
  }

  .sidebar__tree__form__input {
    flex: 1 1 auto;
  }

  .sidebar__tree__form--sending {
    cursor: not-allowed;
  }

  .sidebar__tree__form__spinner {
    position: absolute;
    right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
`
