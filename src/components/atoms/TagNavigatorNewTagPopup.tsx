import React, {
  useMemo,
  useState,
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useCallback,
} from 'react'
import { useEffectOnce } from 'react-use'
import { mdiTag } from '@mdi/js'
import { isTagNameValid } from '../../lib/db/utils'
import { useAnalytics, analyticsEvents } from '../../lib/analytics'
import { PopulatedTagDoc } from '../../lib/db/types'
import styled from '../../shared/lib/styled'
import {
  textColor,
  textOverflow,
  activeBackgroundColor,
} from '../../shared/lib/styled/styleFunctions'
import Icon from '../../shared/components/atoms/Icon'
import FormInput from '../../shared/components/molecules/Form/atoms/FormInput'
import cc from 'classcat'

const Container = styled.div`
  position: relative;
  width: 100%;

  .autocomplete__input {
    line-height: inherit !important;
    height: 28px !important;
    width: 100%;
    margin-top: 4px;
  }

  .autocomplete__container {
    z-index: 9000;
    position: absolute;
    padding: ${({ theme }) => theme.sizes.spaces.xsm}px 0;
    width: 100%;
    height: auto;
    max-height: 70vh;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    border: none;
    left: 0;
    top: 100%;
    background-color: ${({ theme }) => theme.colors.background.primary};
    box-shadow: ${({ theme }) => theme.colors.shadow};
  }

  .autocomplete__option {
    flex-shrink: 0;
    width: 100%;
    padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${({ theme }) => theme.colors.text.subtle};
    text-decoration: none;

    &:hover,
    &:focus {
      background: ${({ theme }) => theme.colors.background.quaternary};
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
`

const MenuButton = styled.button`
  width: 100%;
  height: 30px;
  ${textColor};
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
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
  tags: string[]
  storageTagMap: Map<string, PopulatedTagDoc>
  close: () => void
  appendTagByName: (tagName: string) => void
}

const TagNavigatorNewTagPopup = ({
  tags,
  storageTagMap,
  close,
  appendTagByName,
}: TagNavigatorNewTagPopupProps) => {
  const [newTagName, setNewTagName] = useState('')
  const [menuIndex, setMenuIndex] = useState(0)
  const { report } = useAnalytics()

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

  const tagSet = useMemo(() => {
    return new Set(tags)
  }, [tags])

  const availableTagNames = useMemo(() => {
    return [...storageTagMap.values()].filter((storageTag) => {
      return storageTag != null && !tagSet.has(storageTag.name)
    })
  }, [tagSet, storageTagMap])

  const filteredStorageTags = useMemo(() => {
    if (newTagNameIsEmpty) {
      return availableTagNames
    }
    return availableTagNames.filter((tagDoc) => {
      return tagDoc.name.includes(newTagName)
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
            appendTagByName(filteredStorageTags[menuIndex].name)
            close()
            return
          }

          if (menuIndex === filteredStorageTags.length) {
            setNewTagName('')
            if (isTagNameValid(trimmedNewTagName)) {
              appendTagByName(trimmedNewTagName)
            }
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
    <Container onBlur={handlePopupBlur} ref={containerRef}>
      <FormInput
        id='autocomplete-tags-local'
        ref={inputRef}
        className='autocomplete__input'
        placeholder='Add New Label...'
        value={newTagName}
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          setMenuIndex(0)
          setNewTagName(event.target.value)
        }}
        onKeyDown={handleKeyInput}
        autoComplete='off'
      />
      {filteredStorageTags.length > 0 && (
        <div className='autocomplete__container'>
          {filteredStorageTags.map((storageTag, index) => (
            <MenuButton
              key={storageTag.name}
              className={cc([
                menuIndex === index ? 'active' : '',
                'autocomplete__option',
              ])}
              onClick={() => {
                appendTagByName(storageTag.name)
                setNewTagName('')
                inputRef.current?.focus()
                report(analyticsEvents.appendNoteTag)
              }}
            >
              <Icon path={mdiTag} />
              <span>{storageTag.name}</span>
            </MenuButton>
          ))}
        </div>
      )}

      {!newTagNameIsEmpty &&
        !tagSet.has(trimmedNewTagName) &&
        !storageTagMap.has(trimmedNewTagName) && (
          <div className='autocomplete__container'>
            <MenuButton
              className={cc([
                menuIndex === filteredStorageTags.length ? 'active' : '',
                'autocomplete__option',
              ])}
              onClick={() => {
                appendTagByName(trimmedNewTagName)
                setNewTagName('')
                inputRef.current?.focus()
                report(analyticsEvents.appendNoteTag)
                report(analyticsEvents.addTag)
              }}
            >
              <span>Create</span>&nbsp;
              <Icon path={mdiTag} />
              <span>{newTagName}</span>
            </MenuButton>
          </div>
        )}

      {tags.includes(trimmedNewTagName) && (
        <MenuButton disabled={true}>
          <Icon path={mdiTag} />
          <span>{newTagName} is already added</span>
        </MenuButton>
      )}
    </Container>
  )
}

export default TagNavigatorNewTagPopup
