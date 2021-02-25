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
import styled from '../../lib/styled/styled'
import {
  LocalSearchInputLeft,
  LocalSearchStyledButton,
  SearchResultItem,
  SearchResultNavigationDirection,
} from './LocalSearch'
import { SearchReplaceOptions } from '../../lib/search/search'

interface LocalReplaceProps {
  codeMirror: CodeMirror.EditorFromTextArea
  replaceQuery: string
  searchOptions: SearchReplaceOptions
  numberOfFoundItems: number
  focusingReplace: boolean
  navigateToNext: (direction: SearchResultNavigationDirection) => void
  onUpdateSearchOptions: (searchOptions: Partial<SearchReplaceOptions>) => void
  onReplaceToggle?: (nextState?: boolean) => void
  onReplaceQueryChange?: (newSearchQuery: string) => void
  onReplacementFinished?: () => void
  onFocusSearchInput?: () => void
  onReplaceClose?: () => void
}

const LocalReplace = ({
  codeMirror,
  replaceQuery,
  searchOptions,
  numberOfFoundItems,
  focusingReplace,
  navigateToNext,
  onReplaceToggle,
  onReplaceQueryChange,
  onReplacementFinished,
  onFocusSearchInput,
  onReplaceClose,
  onUpdateSearchOptions,
}: LocalReplaceProps) => {
  const replaceTextAreaRef = useRef<HTMLTextAreaElement>(null)
  const [replaceValue, setReplaceValue] = useState(replaceQuery)
  const [preservingCaseReplace, setPreservingCaseReplace] = useState<boolean>(
    searchOptions.preservingCaseReplace
  )

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

  const focusReplaceTextAreaInput = useCallback((replaceValueLength = 0) => {
    if (replaceTextAreaRef.current == null) {
      return
    }
    replaceTextAreaRef.current.focus()
    if (replaceValueLength > 0) {
      replaceTextAreaRef.current.selectionEnd += replaceValueLength
      replaceTextAreaRef.current.selectionStart = replaceValueLength
    }
  }, [])

  const addNewlineToReplaceValue = useCallback(() => {
    if (replaceTextAreaRef.current === null) {
      return
    }
    const startPosition = replaceTextAreaRef.current.selectionStart
    const endPosition = replaceTextAreaRef.current.selectionEnd
    if (startPosition == endPosition) {
      // no selection -> add newline at this location
      replaceTextAreaRef.current.setRangeText(
        '\n',
        startPosition,
        endPosition,
        'end'
      )
    } else {
      // selection -> replace it with newline
      replaceTextAreaRef.current.setRangeText(
        '\n',
        startPosition,
        endPosition,
        'end'
      )
    }
    setReplaceValue(replaceTextAreaRef.current.value)
    if (onReplaceQueryChange != null) {
      onReplaceQueryChange(replaceValue)
    }
    focusReplaceTextAreaInput()
  }, [focusReplaceTextAreaInput, onReplaceQueryChange, replaceValue])

  const replaceSingleMarker = useCallback(
    (marker: TextMarker) => {
      const markerPosition:
        | MarkerRange
        | CodeMirror.Position
        | undefined = marker.find()
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
        // if first character was upper case - set the replacement to upper case too
        codeMirror.replaceRange(
          foundMarkText.charAt(0) + replaceQuery.substr(1),
          markerRange.from,
          markerRange.to,
          '@ignore'
        )
      } else {
        codeMirror.replaceRange(
          replaceQuery,
          markerRange.from,
          markerRange.to,
          '@ignore'
        )
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

    let anyReplacementSuccessful = false
    for (const marker of markers) {
      const replaceSuccessful = replaceSingleMarker(marker)
      if (replaceSuccessful) {
        anyReplacementSuccessful = true
      }
    }

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
          } else if (!event.repeat) {
            // todo: [komediruzecki-13/02/2021] If we use repeat debounce should be used
            //  could not get debounce to work with onKeyDown properly (need to debounce keyDown
            //  but also prevent propagation on custom functionality)
            //  original issues is that with allowing repeat and holding enter key
            //  it would replace items fast and few seconds after holding the key it would start
            //  entering newlines in replace text area instead of replacing following items
            //  (probably event is fired on some re-render and is able to enter newline in text area
            //  without this handler which stops propagation and uses different 'Enter' key logic)
            onReplaceCurrentItem()
          }
          break
        case 'Tab':
          if (event.shiftKey && onFocusSearchInput) {
            // Focus on search
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
        case 'f':
        case 'F':
          if (event.ctrlKey && onReplaceToggle) {
            onReplaceToggle(false)
          }
          break
      }
    },
    [
      addNewlineToReplaceValue,
      focusReplaceTextAreaInput,
      handleOnReplaceClose,
      navigateToNext,
      onFocusSearchInput,
      onReplaceCurrentItem,
      onReplaceToggle,
      replaceQuery.length,
      getNumberOfTextAreaRows,
      toggleCaseSensitiveReplace,
    ]
  )

  useEffect(() => {
    if (focusingReplace) {
      // focusReplaceTextAreaInput(replaceQuery.length)
      focusReplaceTextAreaInput()
    }
  }, [focusReplaceTextAreaInput, focusingReplace, replaceQuery.length])

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
            <LocalSearchStyledButton
              title={'New Line (Ctrl+Shift+Enter)'}
              className={'button'}
              onClick={addNewlineToReplaceValue}
            >
              <Icon path={mdiSubdirectoryArrowLeft} />
            </LocalSearchStyledButton>
            <LocalSearchStyledButton
              title={
                'Preserve Case (Alt+E) - Use tab to focus on an option and space to toggle'
              }
              className={preservingCaseReplace ? 'active' : ''}
              onClick={toggleCaseSensitiveReplace}
            >
              <Icon path={mdiAlphabeticalVariant} />
            </LocalSearchStyledButton>
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
  background-color: ${({ theme }) => theme.searchSecondaryBackgroundColor};
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
  color: ${({ theme }) => theme.navItemColor};
  &:hover {
    color: ${({ theme }) => theme.navButtonHoverColor};
  }

  &:disabled {
    cursor: default;
    opacity: 0.5;
    &:hover {
      color: ${({ theme }) => theme.navItemColor};
    }
  }
`

const LocalReplaceContainer = styled.div`
  position: relative;
  overflow: hidden;
  z-index: 5001;
  width: 100%;

  background-color: ${({ theme }) => theme.navBackgroundColor};
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
