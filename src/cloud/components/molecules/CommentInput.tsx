import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import Button from '../../../shared/components/atoms/Button'
import styled from '../../../shared/lib/styled'
import Flexbox from '../atoms/Flexbox'
import { useEffectOnce } from 'react-use'
import useSuggestions from '../../../shared/lib/hooks/useSuggestions'
import { SerializedUser } from '../../interfaces/db/user'
import UserIcon from '../atoms/UserIcon'

interface CommentInputProps {
  onSubmit: (comment: string) => any
  value?: string
  autoFocus?: boolean
  users: SerializedUser[]
}

const smallUserIconStyle = { width: '20px', height: '20px', lineHeight: '17px' }
export function CommentInput({
  onSubmit,
  value = '',
  autoFocus = false,
  users,
}: CommentInputProps) {
  const [working, setWorking] = useState(false)
  const inputRef = useRef<HTMLDivElement>(null)
  const onSuggestionSelect = useRef((item: SerializedUser, hint: string) => {
    if (inputRef.current == null) {
      return
    }

    const range = getSelection()?.getRangeAt(0)
    if (range == null) {
      return
    }
    const newRange = new Range()
    newRange.setStart(range.startContainer, range.startOffset - hint.length - 1)
    newRange.setEnd(range.endContainer, range.endOffset)
    range.deleteContents()
    range.insertNode(document.createTextNode(item.uniqueName + ' '))
    range.collapse(false)
  })

  const userSuggestions = useMemo(() => {
    return users.map((user) => ({
      key: user.uniqueName,
      item: user,
    }))
  }, [users])

  const {
    state,
    onKeyDownListener,
    closeSuggestions,
    setSelection,
    triggerAction,
  } = useSuggestions(userSuggestions, onSuggestionSelect.current)

  useEffectOnce(() => {
    if (inputRef.current) {
      inputRef.current.addEventListener('blur', closeSuggestions)
      if (value.length > 0) {
        for (const line of value.split('\n')) {
          const child = document.createElement('div')
          child.textContent = line
          inputRef.current.appendChild(child)
        }
      } else {
        resetInitialContent(inputRef.current)
      }
      if (autoFocus) {
        inputRef.current.focus()
      }
    }
  })

  const submit = useCallback(async () => {
    if (inputRef.current != null) {
      try {
        setWorking(true)
        let content = ''
        for (let i = 0; i < inputRef.current.childNodes.length; i++) {
          const node = inputRef.current.childNodes[i]
          if (i > 0 && !node.TEXT_NODE) {
            content += '\n'
          }
          content += node.textContent
        }
        await onSubmit(content)
        resetInitialContent(inputRef.current)
        inputRef.current.focus()
      } finally {
        setWorking(false)
      }
    }
  }, [onSubmit])

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = useCallback(
    (ev) => {
      onKeyDownListener(ev)

      if (ev.key === 'Enter' && (ev.ctrlKey || ev.metaKey)) {
        ev.preventDefault()
        ev.stopPropagation()
        submit()
        return
      }

      if (ev.key === 'Enter' && ev.shiftKey) {
        ev.preventDefault()
        ev.stopPropagation()
        return
      }
    },
    [submit, onKeyDownListener]
  )

  const selectSuggestion: React.MouseEventHandler = useCallback(
    (ev) => {
      ev.stopPropagation()
      ev.preventDefault()
      triggerAction()
    },
    [triggerAction]
  )

  return (
    <InputContainer>
      <div
        className='comment__input__editable'
        ref={inputRef}
        onKeyDown={onKeyDown}
        contentEditable={!working}
      ></div>
      <Flexbox justifyContent='flex-end'>
        <Button disabled={working} onClick={submit}>
          Post
        </Button>
      </Flexbox>
      {state.type === 'enabled' && (
        <div
          className='comment__input__suggestions'
          style={{
            top: `${state.position.bottom}px`,
          }}
        >
          {state.suggestions.map((user, i) => (
            <div
              key={user.id}
              className={
                user === state.selected
                  ? 'comment__input__suggestions--selected'
                  : ''
              }
              onMouseDown={selectSuggestion}
              onMouseEnter={() => setSelection(i)}
            >
              <UserIcon user={user} style={smallUserIconStyle} />{' '}
              <span>{user.displayName}</span>
            </div>
          ))}
        </div>
      )}
    </InputContainer>
  )
}

const InputContainer = styled.div`
  position: relative;
  width: 100%;
  & .comment__input__editable {
    white-space: pre-wrap;
    resize: none;
    width: 100%;
    border: 1px solid ${({ theme }) => theme.colors.border.second};
    min-height: 60px;
    background-color: ${({ theme }) => theme.colors.background.secondary};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 5px 10px;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.df}px;
  }

  & .comment__input__suggestions {
    position: fixed;
    right: 0;
    width: 400px;
    display: flex;
    flex-direction: column;
    border: 1px solid ${({ theme }) => theme.colors.border.second};
    background-color: ${({ theme }) => theme.colors.background.secondary};
    padding: ${({ theme }) => theme.sizes.spaces.sm}px 0;

    & > div {
      display: flex;
      padding: ${({ theme }) => theme.sizes.spaces.xsm}px;

      & > div {
        margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
      }

      &.comment__input__suggestions--selected {
        background-color: ${({ theme }) => theme.colors.background.tertiary};
      }
    }
  }
`

function resetInitialContent(element: Element) {
  for (let i = 0; i < element.childNodes.length; i++) {
    element.removeChild(element.childNodes[i])
  }

  const child = document.createElement('div')
  child.appendChild(document.createElement('br'))
  element.appendChild(child)
}

export default CommentInput
