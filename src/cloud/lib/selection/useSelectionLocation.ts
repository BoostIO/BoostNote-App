import { MutableRefObject, useState, useEffect } from 'react'
import useSelection from './useSelection'

export type Rect = { x: number; y: number; width: number; height: number }

interface SelectionLocation {
  viewport: Rect
  global: Rect
  local?: Rect
}

interface State {
  selection: ReturnType<typeof useSelection>
  location: SelectionLocation | null
}

function useSelectionLocation(element: MutableRefObject<Element | null>) {
  const selection = useSelection(element)
  const [state, setState] = useState<State>({ selection, location: null })

  useEffect(() => {
    setState(() => {
      return {
        selection,
        location:
          selection.type === 'some'
            ? buildLocation(selection.selection, element.current)
            : null,
      }
    })
  }, [selection, element])

  useEffect(() => {
    if (element.current != null) {
      const observer = new (window as any).ResizeObserver(() => {
        setState((state) => {
          if (state.selection.type === 'none') {
            return state
          }

          return {
            selection: state.selection,
            location: buildLocation(state.selection.selection, element.current),
          }
        })
      })

      observer.observe(element.current)
      return () => observer.disconnect()
    }
    return undefined
  }, [element])

  return state
}

function buildLocation(
  selection: Selection,
  element?: Element | null
): SelectionLocation {
  const rect = selection.getRangeAt(0).getBoundingClientRect()
  const viewport = {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  }

  return {
    viewport,
    global: viewportToGlobal(viewport),
    local: element != null ? viewportToLocal(viewport, element) : undefined,
  }
}

function viewportToGlobal(vRect: Rect): Rect {
  return { ...vRect, x: vRect.x + window.scrollX, y: vRect.y + window.scrollY }
}

function viewportToLocal(vRect: Rect, element: Element): Rect {
  const { top, left } = element.getBoundingClientRect()
  return {
    ...vRect,
    x: vRect.x - left + element.scrollLeft,
    y: vRect.y - top + element.scrollTop,
  }
}

export default useSelectionLocation
