import React, { useState, useCallback, useRef } from 'react'
import styled from '../../../../lib/styled'
import cc from 'classcat'
import { inputStyle } from '../../../../lib/styled/styleFunctions'
import { useEffectOnce } from 'react-use'
import { useNav } from '../../../../lib/stores/nav'
import Spinner from '../../../atoms/CustomSpinner'
import { useToast } from '../../../../../lib/v2/stores/toast'

interface SideNavigatorFolderFormProps {
  workspaceId?: string
  parentFolderId?: string
  style?: React.CSSProperties
  depth?: number
  close: () => void
}

const SideNavigatorFolderForm = ({
  parentFolderId,
  workspaceId,
  style,
  depth = 0,
  close,
}: SideNavigatorFolderFormProps) => {
  const [sending, setSending] = useState<boolean>(false)
  const [name, setName] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { createFolderHandler } = useNav()
  const { pushApiErrorMessage } = useToast()

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

  const submitCreateFolder = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault()

      if (workspaceId == null || name.trim() === '') {
        close()
        return
      }

      const body = {
        folderName: name,
        description: '',
        parentFolderId,
        workspaceId,
      }

      setSending(true)
      try {
        await createFolderHandler(body)
        close()
      } catch (error) {
        pushApiErrorMessage(error)
        close()
      }
    },
    [
      name,
      workspaceId,
      parentFolderId,
      createFolderHandler,
      pushApiErrorMessage,
      close,
    ]
  )

  return (
    <StyledSideNavigatorFolderForm
      style={{ ...style, paddingLeft: `${12 * depth + 4}px` }}
      onSubmit={submitCreateFolder}
    >
      <div
        className={cc([sending && 'sending'])}
        onClick={() => setSending(false)}
      >
        <StyledInput
          value={name}
          onChange={updateName}
          ref={inputRef}
          onBlur={onBlur}
          disabled={sending}
        />
        {sending && <Spinner className='emphasized spinner' />}
      </div>
    </StyledSideNavigatorFolderForm>
  )
}

export default SideNavigatorFolderForm

const StyledSideNavigatorFolderForm = styled.form`
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
