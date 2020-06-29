import React, {
  useMemo,
  useState,
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useCallback,
} from 'react'
import {
  border,
  backgroundColor,
  borderColor,
  contextMenuShadow,
  uiTextColor,
  activeBackgroundColor,
  textOverflow,
} from '../../lib/styled/styleFunctions'
import styled from '../../lib/styled'
import { useEffectOnce } from 'react-use'
import { menuZIndex } from '../../lib/contextMenu'
import { mdiPound } from '@mdi/js'
import Icon from './Icon'

const Container = styled.div`
  position: fixed;
  top: 40px;
  background-color: white;
  width: 200px;

  ${backgroundColor}
  ${border}
  z-index: ${menuZIndex};
  ${backgroundColor}
  ${borderColor}
  ${contextMenuShadow}
`

const TagNameInput = styled.input`
  width: 100%;
  height: 30px;
  padding: 0 0.25em;
`

const MenuButton = styled.button`
  width: 100%;
  height: 30px;
  ${uiTextColor};
  background-color: transparent;
  border: none;
  text-align: left;
  padding: 0 20px;
  ${textOverflow}
  &:hover,
  &:focus,
  &:active,
  &.active {
    ${activeBackgroundColor}
  }
  &:disabled {
    background-color: transparent;
  }
`

interface TagNavigatorNewTagPopupProps {
  position: { x: number; y: number }
  tags: string[]
  storageTags: string[]
  close: () => void
  appendTagByName: (tagName: string) => void
}

const TagNavigatorNewTagPopup = ({
  position,
  tags,
  storageTags,
  close,
  appendTagByName,
}: TagNavigatorNewTagPopupProps) => {
  const [newTagName, setNewTagName] = useState('')
  const [menuIndex, setMenuIndex] = useState(0)

  const trimmedNewTagName = useMemo(() => {
    return newTagName.trim()
  }, [newTagName])

  const newTagNameIsEmpty = useMemo(() => {
    return trimmedNewTagName.length === 0
  }, [trimmedNewTagName])

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffectOnce(() => {
    inputRef.current!.focus()
  })

  const availableTagNames = useMemo(() => {
    const tagSet = new Set(tags)

    return storageTags.filter((storageTag) => {
      return storageTag != null && !tagSet.has(storageTag)
    })
  }, [tags, storageTags])

  const filteredStorageTags = useMemo(() => {
    if (newTagNameIsEmpty) {
      return availableTagNames
    }
    return availableTagNames.filter((tagName) => {
      return tagName.includes(newTagName)
    })
  }, [newTagNameIsEmpty, availableTagNames, newTagName])

  const selectNextMenuItem = useCallback(() => {
    setMenuIndex((prevMenuIndex) => {
      if (prevMenuIndex >= filteredStorageTags.length) {
        return filteredStorageTags.length
      }
      return prevMenuIndex + 1
    })
  }, [filteredStorageTags.length])

  const selectPreviousMenuItem = useCallback(() => {
    setMenuIndex((prevMenuIndex) => {
      if (prevMenuIndex === 0) {
        return 0
      }
      return prevMenuIndex - 1
    })
  }, [])

  const handleKeyInput = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          selectNextMenuItem()
          break
        case 'ArrowUp':
          event.preventDefault()
          selectPreviousMenuItem()
          break
        case 'Enter':
          if (newTagNameIsEmpty && filteredStorageTags.length === 0) {
            return
          }
          if (menuIndex < filteredStorageTags.length) {
            setNewTagName('')
            appendTagByName(filteredStorageTags[menuIndex])
            close()
            return
          }

          if (menuIndex === filteredStorageTags.length) {
            setNewTagName('')
            appendTagByName(trimmedNewTagName)
            close()
            return
          }
          break
        case 'Escape':
          close()
          break
      }
    },
    [
      selectNextMenuItem,
      selectPreviousMenuItem,
      filteredStorageTags,
      menuIndex,
      appendTagByName,
      close,
      trimmedNewTagName,
      newTagNameIsEmpty,
    ]
  )

  const handlePopupBlur = useCallback(
    (event: FocusEvent) => {
      let relatedTarget: HTMLElement | null = event.relatedTarget as HTMLElement

      while (relatedTarget != null) {
        if (relatedTarget === containerRef.current) {
          return
        }
        relatedTarget = relatedTarget.parentElement
      }
      close()
    },
    [close]
  )

  return (
    <Container
      style={{ left: position.x - 100 }}
      onBlur={handlePopupBlur}
      ref={containerRef}
    >
      <TagNameInput
        ref={inputRef}
        value={newTagName}
        placeholder='Tag Name...'
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setMenuIndex(0)
          setNewTagName(event.target.value)
        }}
        onKeyDown={handleKeyInput}
      />
      <>
        {filteredStorageTags.map((storageTag, index) => (
          <MenuButton
            key={storageTag}
            className={menuIndex === index ? 'active' : ''}
            onClick={() => {
              appendTagByName(storageTag)
              setNewTagName('')
              inputRef.current?.focus()
            }}
          >
            <Icon path={mdiPound} />
            <span>{storageTag}</span>
          </MenuButton>
        ))}
      </>
      {!newTagNameIsEmpty &&
        !tags.includes(trimmedNewTagName) &&
        !storageTags.includes(trimmedNewTagName) && (
          <MenuButton
            className={menuIndex === filteredStorageTags.length ? 'active' : ''}
            onClick={() => {
              appendTagByName(trimmedNewTagName)
              setNewTagName('')
              inputRef.current?.focus()
            }}
          >
            <span>Create</span> <Icon path={mdiPound} />
            <span>{newTagName}</span>
          </MenuButton>
        )}
      {tags.includes(trimmedNewTagName) && (
        <MenuButton disabled={true}>
          <Icon path={mdiPound} />
          <span>{newTagName} is already added</span>
        </MenuButton>
      )}
    </Container>
  )
}

export default TagNavigatorNewTagPopup
