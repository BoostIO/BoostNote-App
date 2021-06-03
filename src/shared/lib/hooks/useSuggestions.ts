import { useState, useCallback } from 'react'
import prop from 'ramda/es/prop'

interface State<T> {
  suggestions: Suggestion<T>[]
  filter: string
  action: (item: T, hint: string) => void
  display: SuggestionState<T>
}

type SuggestionState<T> =
  | { type: 'disabled' }
  | { type: 'enabled'; position: DOMRect; suggestions: T[]; selected: T }

interface Suggestion<T> {
  key: string
  item: T
}

const closeKeys = new Set([
  'Esc',
  'Escape',
  'ArrowRight',
  'ArrowLeft',
  'Delete',
])

function useSuggestions<T>(
  suggestions: Suggestion<T>[],
  action: (item: T, hint: string) => void
) {
  const [state, setState] = useState<State<T>>({
    suggestions,
    filter: '',
    action,
    display: { type: 'disabled' },
  })

  // oncompositionend

  const onKeyDownListener: React.KeyboardEventHandler = useCallback(
    (ev) => {
      if (ev.key === '@') {
        setState(open)
      }

      if (ev.key.length === 1) {
        setState(appendFilter(ev.key))
      }

      if (ev.key === 'Backspace') {
        setState(deleteFilter(1))
      }

      if (closeKeys.has(ev.key)) {
        setState(close)
      }

      if (ev.key === 'ArrowUp') {
        ev.preventDefault()
        setState(navigate(-1))
      }

      if (ev.key === 'ArrowDown') {
        ev.preventDefault()
        setState(navigate(1))
      }

      if (ev.key === 'Enter') {
        if (state.display.type === 'enabled') {
          ev.preventDefault()
          ev.stopPropagation()
          setState(doAction)
        }
      }
    },
    [state]
  )

  const closeSuggestions = useCallback(() => {
    setState(close)
  }, [])

  const triggerAction = useCallback(() => {
    setState(doAction)
  }, [])

  const setSelection = useCallback((i: number) => {
    setState(navigateTo(i))
  }, [])

  return {
    state: state.display,
    onKeyDownListener,
    closeSuggestions,
    triggerAction,
    setSelection,
  }
}

function doAction<T>(state: State<T>): State<T> {
  console.log(state)
  if (state.display.type === 'disabled') {
    return state
  }

  state.action(state.display.selected, state.filter)
  return { ...state, display: { type: 'disabled' } }
}

function open<T>(state: State<T>): State<T> {
  if (state.display.type === 'enabled') {
    return state
  }
  const position = getSelectionPosition()
  if (position == null) {
    return state
  }
  const suggestions = state.suggestions.map(prop('item'))
  return {
    ...state,
    filter: '',
    display: {
      type: 'enabled',
      suggestions,
      selected: suggestions[0],
      position,
    },
  }
}

function close<T>(state: State<T>): State<T> {
  return state.display.type === 'disabled'
    ? state
    : {
        ...state,
        filter: '',
        display: { type: 'disabled' },
      }
}

function navigate(distance: number) {
  return <T>(state: State<T>): State<T> => {
    if (state.display.type === 'disabled') {
      return state
    }

    const suggestionsLength = state.display.suggestions.length
    const selected = state.display.selected
    const currentFilterIndex = state.display.suggestions.findIndex(
      (suggestion) => suggestion === selected
    )
    const newIndex = Math.max(
      Math.min(suggestionsLength - 1, currentFilterIndex + distance),
      0
    )
    return {
      ...state,
      display: {
        ...state.display,
        selected: state.display.suggestions[newIndex],
      },
    }
  }
}

function navigateTo(i: number) {
  return <T>(state: State<T>): State<T> => {
    if (state.display.type === 'disabled') {
      return state
    }

    const suggestionsLength = state.display.suggestions.length
    const newIndex = Math.max(Math.min(suggestionsLength - 1, i), 0)
    return {
      ...state,
      display: {
        ...state.display,
        selected: state.display.suggestions[newIndex],
      },
    }
  }
}

function appendFilter(str: string) {
  return <T>(state: State<T>): State<T> => {
    if (
      state.display.type === 'disabled' ||
      (state.filter === '' && str === '@')
    ) {
      return state
    }
    return filterSuggestions(state.filter + str, state)
  }
}

function deleteFilter(count: number) {
  return <T>(state: State<T>): State<T> => {
    if (state.display.type === 'disabled') {
      return state
    }

    if (state.filter === '') {
      return { ...state, display: { type: 'disabled' } }
    }

    const charsToRemove = Math.max(0, count)
    return filterSuggestions(
      state.filter.substr(0, state.filter.length - charsToRemove),
      state
    )
  }
}

function filterSuggestions<T>(newFilter: string, state: State<T>): State<T> {
  if (state.display.type === 'disabled') {
    return state
  }

  const filtered = state.suggestions
    .filter((suggestion) => suggestion.key.startsWith(newFilter))
    .map(prop('item'))

  return filtered.length > 0
    ? {
        ...state,
        filter: newFilter,
        display: {
          ...state.display,
          suggestions: filtered,
          selected: filtered[0],
        },
      }
    : {
        ...state,
        filter: '',
        display: { type: 'disabled' },
      }
}

function getSelectionPosition() {
  const selection = document.getSelection()
  if (
    selection == null ||
    selection.anchorNode == null ||
    selection.type !== 'Caret'
  ) {
    return null
  }

  const range = selection.getRangeAt(0)
  const tempElement = document.createElement('span')
  range.insertNode(tempElement)
  const rect = tempElement.getBoundingClientRect()
  tempElement.remove()
  return rect
}
export default useSuggestions
