import { useEffect, useState, useRef, MutableRefObject } from 'react'
import debounce from 'lodash.debounce'

type SelectionState =
  | { type: 'none' }
  | {
      type: 'some'
      selection: Selection
    }

function useSelection(node?: MutableRefObject<Element | null>) {
  const selectionRef = useRef(getSelection())
  const [currentSelection, setCurrentSelection] = useState<SelectionState>({
    type: 'none',
  })

  useEffect(() => {
    const listener = debounce(() => {
      if (
        node == null ||
        (node.current != null &&
          isSelectionInNode(node.current, selectionRef.current))
      ) {
        setCurrentSelection(convertSelectionToState(selectionRef.current))
      } else {
        setCurrentSelection((prev) => {
          return prev.type === 'none' ? prev : { type: 'none' }
        })
      }
    }, 200)

    document.addEventListener('selectionchange', listener)
    return () => document.removeEventListener('selectionchange', listener)
  }, [node])

  return currentSelection
}

function isSelectionInNode(
  node: Element,
  selection: ReturnType<typeof getSelection>
) {
  if (selection == null) return false
  if (selection.anchorNode == null || selection.focusNode == null) return false

  return (
    node.contains(selection.anchorNode) && node.contains(selection.focusNode)
  )
}

function convertSelectionToState(
  selection: ReturnType<typeof getSelection>
): SelectionState {
  if (selection == null) return { type: 'none' }
  if (selection.type === 'none') return { type: 'none' }
  return { type: 'some', selection }
}

export default useSelection
