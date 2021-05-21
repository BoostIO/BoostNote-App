import { Node, Position } from 'unist'
import visit from 'unist-util-visit'

export interface HighlightRange {
  id: string
  start: number
  end: number
  active: boolean
}

function rehypeHighlight(ranges: HighlightRange[]) {
  return (tree: Node) => {
    // open to optimisation
    for (const range of ranges) {
      visit(tree, includesTextRange(range), (node) => {
        node.children = node.children.flatMap((child) => {
          if (
            child.type === 'text' &&
            child.position?.start?.offset != null &&
            child.position?.end?.offset != null &&
            typeof child.value === 'string' &&
            containsPartialPosition(child.position)(range)
          ) {
            const localStart = Math.max(
              range.start - child.position.start.offset,
              0
            )
            const localEnd = Math.min(
              range.end - child.position.start.offset,
              child.value.length
            )

            const start = child.value.substring(0, localStart)
            const wrapped = child.value.substring(localStart, localEnd)
            const end = child.value.substring(localEnd)

            const children: Node[] = []

            if (start != '') {
              const transformedPosition = transformPosition(
                child.position,
                0,
                start.length
              )
              children.push({
                type: 'text',
                value: start,
                position: transformedPosition,
              })
            }

            if (wrapped != '') {
              const transformedPosition = transformPosition(
                child.position,
                localStart,
                wrapped.length
              )
              const wrappedChild = {
                type: 'element',
                tagName: 'span',
                children: [
                  {
                    type: 'text',
                    value: wrapped,
                    position: transformedPosition,
                  },
                ],
                properties: {
                  class: `inline-comment ${range.active ? 'active' : ''}`,
                  'data-inline-comment': range.id,
                },
                position: transformedPosition,
                generatedBy: range.id,
              }
              children.push(wrappedChild)
            }

            if (end != '') {
              const transformedPosition = transformPosition(
                child.position,
                localEnd,
                end.length
              )
              const wrappedChild = {
                type: 'element',
                tagName: 'span',
                children: [
                  {
                    type: 'text',
                    value: end,
                    position: transformedPosition,
                  },
                ],
                position: transformedPosition,
                generatedBy: range.id,
              }
              children.push(wrappedChild)
            }
            return children
          }
          return child
        })
      })
    }
  }
}

function transformPosition(
  position: Position,
  offset: number,
  length: number
): Position {
  return {
    start: {
      line: position.start.line,
      column: position.start.column + offset,
      offset: position.start.offset! + offset,
    },
    end: {
      line: position.start.line,
      column: position.start.column + offset + length,
      offset: position.start.offset! + offset + length,
    },
  }
}

function includesTextRange(range: HighlightRange) {
  return (node: unknown): node is Node & { children: Node[] } => {
    const n = node as Node
    return (
      n.generatedBy !== range.id &&
      n.position != null &&
      Array.isArray(n.children) &&
      n.children.some((node) => node.type === 'text') &&
      containsPartialPosition(n.position)(range)
    )
  }
}

function containsPartialPosition(position: Position) {
  return (range: HighlightRange) => {
    const start = position.start.offset
    const end = position.end.offset

    return (
      start != null &&
      end != null &&
      ((range.start >= start && range.start <= end) ||
        (range.end >= start && range.end <= end))
    )
  }
}

export default rehypeHighlight
