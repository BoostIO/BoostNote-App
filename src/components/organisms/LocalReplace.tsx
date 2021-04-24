import React, {
  useState,
  ChangeEventHandler,
  useCallback,
  useRef,
  KeyboardEvent,
  useMemo,
  useEffect,
} from 'react'
import CodeMirror, { MarkerRange, TextMarker } from 'codemirror'
import Icon from '../atoms/Icon'
import {
  mdiAlphabeticalVariant,
  mdiMagnify,
  mdiSubdirectoryArrowLeft,
} from '@mdi/js'
import {
  LocalSearchInputLeft,
  SearchResultNavigationDirection,
} from './LocalSearch'
import { SearchReplaceOptions } from '../../lib/search/search'
import LocalSearchButton from '../atoms/search/LocalSearchButton'
import { SearchResultItem } from '../atoms/search/SearchResultItem'
import { usePreferences } from '../../lib/preferences'
import { compareEventKeyWithKeymap } from '../../lib/keymap'
import styled from '../../shared/lib/styled'

interface LocalReplaceProps {
  codeMirror: CodeMirror.EditorFromTextArea
  replaceQuery: string
  searchOptions: SearchReplaceOptions
  numberOfFoundItems: number

  navigateToNext: (direction: SearchResultNavigationDirection) => void
  onUpdateSearchOptions: (searchOptions: Partial<SearchReplaceOptions>) => void
  onReplaceToggle?: (nextState?: boolean) => void
  onReplaceQueryChange?: (newSearchQuery: string) => void
  onReplacementFinished?: () => void
  onFocusSearchInput?: () => void
  onReplaceClose?: () => void
  setReplaceTextAreaRef?: (replaceTextAreaRef: HTMLTextAreaElement) => void
}

const LocalReplace = ({
  codeMirror,
  replaceQuery,
  searchOptions,
  numberOfFoundItems,
  navigateToNext,
  onReplaceToggle,
  onReplaceQueryChange,
  onReplacementFinished,
  onFocusSearchInput,
  onReplaceClose,
  onUpdateSearchOptions,
  setReplaceTextAreaRef,
}: LocalReplaceProps) => {
  const replaceTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const [replaceValue, setReplaceValue] = useState(replaceQuery)
  const [preservingCaseReplace, setPreservingCaseReplace] = useState<boolean>(
    searchOptions.preservingCaseReplace
  )

  const { preferences } = usePreferences()

  const getNumberOfTextAreaRows = useMemo(() => {
    const replaceNumLines = replaceValue ? replaceValue.split('\n').length : 0
    return replaceNumLines == 0 || replaceNumLines == 1
      ? 1
      : replaceNumLines + 1
  }, [replaceValue])

  const updateReplaceValue: ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      setReplaceValue(event.target.value)
      if (onReplaceQueryChange != null) {
        onReplaceQueryChange(event.target.value)
      }
    },
    [onReplaceQueryChange]
  )

  const handleOnReplaceClose = useCallback(() => {
    if (onReplaceClose != null) {
      onReplaceClose()
    }
  }, [onReplaceClose])

  const focusReplaceTextAreaInput = useCallback((focusPoint = 0) => {
    if (replaceTextAreaRef.current == null) {
      return
    }
    replaceTextAreaRef.current.focus()
    if (focusPoint > 0) {
      replaceTextAreaRef.current.selectionEnd = focusPoint
      replaceTextAreaRef.current.selectionStart = focusPoint
    }
  }, [])

  const addNewlineToReplaceValue = useCallback(() => {
    if (replaceTextAreaRef.current === null) {
      return
    }
    const startPosition = replaceTextAreaRef.current.selectionStart
    const endPosition = replaceTextAreaRef.current.selectionEnd

    replaceTextAreaRef.current.setRangeText(
      '\n',
      startPosition,
      endPosition,
      'end'
    )

    setReplaceValue(replaceTextAreaRef.current.value)
    if (onReplaceQueryChange != null) {
      onReplaceQueryChange(replaceValue)
    }
    focusReplaceTextAreaInput()
  }, [focusReplaceTextAreaInput, onReplaceQueryChange, replaceValue])

  const replaceSingleMarker = useCallback(
    (marker: TextMarker) => {
      const markerPosition = marker.find()
      if (markerPosition === undefined) {
        return false
      }

      let markerRange: MarkerRange
      if ('from' in markerPosition) {
        markerRange = markerPosition
      } else {
        markerRange = { from: markerPosition, to: markerPosition }
      }

      const foundMarkText = codeMirror.getRange(
        markerRange.from,
        markerRange.to
      )

      if (foundMarkText.length >= 1 && preservingCaseReplace) {
        const foundItemFirstLetterIsUpperCase =
          foundMarkText.charAt(0) != foundMarkText.charAt(0).toLowerCase()
        const preservedFirstCharacterCase = foundItemFirstLetterIsUpperCase
          ? replaceQuery.charAt(0).toUpperCase()
          : replaceQuery.charAt(0).toLowerCase()
        // if first character was upper case - set the replacement to upper case too and vice versa
        codeMirror.replaceRange(
          preservedFirstCharacterCase + replaceQuery.substr(1),
          markerRange.from,
          markerRange.to
        )
      } else {
        codeMirror.replaceRange(replaceQuery, markerRange.from, markerRange.to)
      }

      return true
    },
    [codeMirror, preservingCaseReplace, replaceQuery]
  )

  const findSelectedMarker = useCallback(() => {
    for (const marker of codeMirror.getAllMarks()) {
      if (marker.className === 'marked selected') {
        return marker
      }
    }
    return null
  }, [codeMirror])

  const onReplaceCurrentItem = useCallback(() => {
    const marker = findSelectedMarker()
    if (!marker) {
      return
    }

    const replaceSuccessful = replaceSingleMarker(marker)
    if (onReplacementFinished != null && replaceSuccessful) {
      onReplacementFinished()
    }
    focusReplaceTextAreaInput(replaceQuery.length)
  }, [
    findSelectedMarker,
    focusReplaceTextAreaInput,
    onReplacementFinished,
    replaceQuery.length,
    replaceSingleMarker,
  ])

  const onReplaceAll = useCallback(() => {
    const markers: TextMarker[] = codeMirror.getAllMarks()
    if (markers.length <= 0) {
      return
    }

    const anyReplacementSuccessful = codeMirror.operation<boolean>(function () {
      let anyReplacementSuccessful = false
      for (const marker of markers) {
        const replaceSuccessful = replaceSingleMarker(marker)
        if (replaceSuccessful) {
          anyReplacementSuccessful = true
        }
      }
      return anyReplacementSuccessful
    })
    if (onReplacementFinished != null && anyReplacementSuccessful) {
      onReplacementFinished()
    }
  }, [codeMirror, onReplacementFinished, replaceSingleMarker])

  const handleExcludeCurrentItem = useCallback(() => {
    navigateToNext('next')
    focusReplaceTextAreaInput(replaceQuery.length)
  }, [focusReplaceTextAreaInput, navigateToNext, replaceQuery.length])

  const toggleCaseSensitiveReplace = useCallback(() => {
    onUpdateSearchOptions({ preservingCaseReplace: !preservingCaseReplace })
    setPreservingCaseReplace(!preservingCaseReplace)
    focusReplaceTextAreaInput()
  }, [focusReplaceTextAreaInput, onUpdateSearchOptions, preservingCaseReplace])

  const handleReplaceInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      switch (event.key) {
        case 'Enter':
          event.preventDefault()
          event.stopPropagation()
          if (event.ctrlKey && event.shiftKey) {
            addNewlineToReplaceValue()
          } else {
            onReplaceCurrentItem()
          }
          break
        case 'Tab':
          if (event.shiftKey && onFocusSearchInput) {
            event.preventDefault()
            event.stopPropagation()
            onFocusSearchInput()
          }
          break
        case 'e':
        case 'E':
          if (event.altKey) {
            event.preventDefault()
            event.stopPropagation()
            toggleCaseSensitiveReplace()
          }
          break
        case 'F3':
          if (event.shiftKey) {
            navigateToNext('previous')
            focusReplaceTextAreaInput(replaceQuery.length)
          } else {
            navigateToNext('next')
            focusReplaceTextAreaInput(replaceQuery.length)
          }
          break
        case 'ArrowDown':
          if (getNumberOfTextAreaRows <= 1) {
            event.preventDefault()
            event.stopPropagation()
            navigateToNext('next')
            focusReplaceTextAreaInput(replaceQuery.length)
          }
          break
        case 'ArrowUp':
          if (getNumberOfTextAreaRows <= 1) {
            event.preventDefault()
            event.stopPropagation()
            navigateToNext('previous')
            focusReplaceTextAreaInput(replaceQuery.length)
          }
          break
        case 'Escape':
          handleOnReplaceClose()
          break
      }

      const keymap = preferences['general.keymap']
      if (keymap == null || onReplaceToggle == null) {
        return
      }
      const localSearchKeymapItem = keymap.get('toggleLocalSearch')
      if (compareEventKeyWithKeymap(localSearchKeymapItem, event)) {
        onReplaceToggle(false)
      }
    },
    [
      preferences,
      onFocusSearchInput,
      getNumberOfTextAreaRows,
      handleOnReplaceClose,
      addNewlineToReplaceValue,
      onReplaceCurrentItem,
      toggleCaseSensitiveReplace,
      navigateToNext,
      focusReplaceTextAreaInput,
      replaceQuery.length,
      onReplaceToggle,
    ]
  )

  useEffect(() => {
    if (setReplaceTextAreaRef != null && replaceTextAreaRef.current != null) {
      setReplaceTextAreaRef(replaceTextAreaRef.current)
    }
  }, [replaceTextAreaRef, setReplaceTextAreaRef])

  return (
    <LocalReplaceContainer>
      <SearchResultItem>
        <LocalSearchInputLeft>
          <LocalReplaceIcon
            className={getNumberOfTextAreaRows != 1 ? 'alignStart' : ''}
          >
            <Icon path={mdiMagnify} />
          </LocalReplaceIcon>
          <textarea
            onClick={focusReplaceTextAreaInput}
            rows={getNumberOfTextAreaRows}
            value={replaceValue}
            onInput={updateReplaceValue}
            onChange={updateReplaceValue}
            // onChange={() => undefined}
            onKeyDown={handleReplaceInputKeyDown}
            ref={replaceTextAreaRef}
          />
          <SearchOptionsInnerContainer>
            <LocalSearchButton
              title={'New Line (Ctrl+Shift+Enter)'}
              className={'button'}
              onClick={addNewlineToReplaceValue}
              iconPath={mdiSubdirectoryArrowLeft}
            />
            <LocalSearchButton
              title={
                'Preserve Case (Alt+E) - Use tab to focus on an option and space to toggle'
              }
              className={preservingCaseReplace ? 'active' : ''}
              onClick={toggleCaseSensitiveReplace}
              iconPath={mdiAlphabeticalVariant}
            />
          </SearchOptionsInnerContainer>
        </LocalSearchInputLeft>
        <ReplaceRightContainer>
          <SearchOptionsOuterContainer>
            <ReplaceStyledButton
              disabled={numberOfFoundItems == 0}
              onClick={onReplaceCurrentItem}
            >
              Replace
            </ReplaceStyledButton>
            <ReplaceStyledButton
              disabled={numberOfFoundItems == 0}
              onClick={onReplaceAll}
            >
              Replace All
            </ReplaceStyledButton>
            <ReplaceStyledButton
              disabled={numberOfFoundItems == 0}
              onClick={handleExcludeCurrentItem}
            >
              Exclude
            </ReplaceStyledButton>
          </SearchOptionsOuterContainer>
        </ReplaceRightContainer>
      </SearchResultItem>
    </LocalReplaceContainer>
  )
}

export default LocalReplace

const ReplaceRightContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 6px 6px 0 0;
  align-content: stretch;
  align-self: stretch;
  align-items: flex-start;
  background-color: ${({ theme }) => theme.colors.background.secondary};
`

const ReplaceStyledButton = styled.button`
  background-color: transparent;
  cursor: pointer;

  border-radius: 3px;
  padding: 2px 12px 2px 12px;
  margin-left: 4px;
  border: 1px solid #5f6161;
  font-weight: normal;
  font-size: 13px;

  overflow: hidden;
  transition: color 200ms ease-in-out;
  color: ${({ theme }) => theme.colors.text.secondary};
  &:hover {
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
    &:hover {
      color: ${({ theme }) => theme.colors.text.subtle};
    }
  }
`

const LocalReplaceContainer = styled.div`
  position: relative;
  overflow: hidden;
  z-index: 5001;
  width: 100%;

  background-color: ${({ theme }) => theme.colors.background.tertiary};
`
const LocalReplaceIcon = styled.div`
  display: flex;
  align-items: center;
  &.alignStart {
    align-items: self-start;
  }
`
const SearchOptionsOuterContainer = styled.div`
  align-content: center;
`

const SearchOptionsInnerContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-items: center;
  justify-content: center;
  align-content: center;
`
