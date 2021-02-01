import throttle from 'lodash.throttle'
import { AnimationHandle, smoothScroll } from '../animations'

export interface ScrollSync {
  rebuild: () => void
  pause: () => void
  unpause: () => void
  destroy: () => void
}

interface HeightData {
  scrollHeights: number[]
  lineHeights: number[]
  viewTop: number
  viewBottom: number
}

export function scrollSyncer(
  editor: CodeMirror.Editor,
  view: HTMLDivElement
): ScrollSync {
  let heightData = buildScrollMap(view, editor)
  let paused = false
  let animating: 'editor' | 'view' | '' = ''
  let handle: AnimationHandle | null = null
  let prevHeight = view.scrollHeight

  const resetState = () => {
    animating = ''
    handle = null
  }

  const cancelCurrent = () => {
    handle && handle.cancel()
  }

  const rebuild = () => {
    heightData = buildScrollMap(view, editor)
    prevHeight = view.scrollHeight
  }

  const rebuildOnResize = () => {
    if (prevHeight !== view.scrollHeight) {
      rebuild()
    }
  }

  const editorScrollCallback = throttle(() => {
    if (animating !== 'editor' && !paused) {
      cancelCurrent()
      rebuildOnResize()
      const to = syncScrollToView(editor, heightData)
      animating = 'view'
      handle = smoothScroll(view, to, resetState)
    }
  }, 10)

  const viewScrollCallback = throttle(() => {
    if (animating !== 'view' && !paused) {
      cancelCurrent()
      rebuildOnResize()
      const to = syncScrollToEdit(editor, view, heightData)
      animating = 'editor'
      handle = smoothScroll(
        editor.getScrollerElement() as HTMLDivElement,
        to,
        resetState
      )
    }
  }, 10)

  editor.on('scroll', editorScrollCallback)
  view.addEventListener('scroll', viewScrollCallback)

  return {
    rebuild: throttle(rebuild, 10),
    pause: () => (paused = true),
    unpause: () => (paused = false),
    destroy: () => {
      editor.off('scroll', editorScrollCallback)
      view.removeEventListener('scroll', viewScrollCallback)
    },
  }
}

function buildScrollMap(
  viewArea: HTMLDivElement,
  editor: CodeMirror.Editor
): HeightData {
  const viewRect = viewArea.getBoundingClientRect()
  const offset = viewArea.scrollTop - (viewRect.top + window.scrollY)
  const scrollHeights = []
  const nonEmptyList = []
  const lineHeights = []
  const viewTop = 0
  const viewBottom = viewArea.scrollHeight - viewRect.height

  let acc = 0
  const lines = editor.lineCount()
  const lineHeight = editor.defaultTextHeight()
  for (let i = 0; i < lines; i++) {
    const str = editor.getLine(i)

    lineHeights.push(acc)

    if (str.length === 0) {
      acc++
      continue
    }

    const h = editor.heightAtLine(i + 1) - editor.heightAtLine(i)
    acc += Math.round(h / lineHeight)
  }
  lineHeights.push(acc)
  const linesCount = acc

  for (let i = 0; i < linesCount; i++) {
    scrollHeights.push(-1)
  }

  nonEmptyList.push(0)
  scrollHeights[0] = viewTop

  const parts = viewArea.querySelectorAll('[data-line]')
  for (let i = 0; i < parts.length; i++) {
    let t = parseInt(parts[i].getAttribute('data-line') || '')
    if (isNaN(t)) {
      continue
    }
    t = lineHeights[t]
    if (t !== 0 && t !== nonEmptyList[nonEmptyList.length - 1]) {
      nonEmptyList.push(t)
    }
    const rect = parts[i].getBoundingClientRect()
    const eleOffset = rect.top + window.scrollY
    scrollHeights[t] = Math.round(eleOffset + offset - 10)
  }

  nonEmptyList.push(linesCount)
  scrollHeights[linesCount] = viewArea.scrollHeight

  let pos = 0
  for (let i = 1; i < linesCount; i++) {
    if (scrollHeights[i] !== -1) {
      pos++
      continue
    }

    const a = nonEmptyList[pos]
    const b = nonEmptyList[pos + 1]
    scrollHeights[i] = Math.round(
      (scrollHeights[b] * (i - a) + scrollHeights[a] * (b - i)) / (b - a)
    )
  }

  scrollHeights[0] = 0

  return { scrollHeights, lineHeights, viewTop, viewBottom }
}

export function syncScrollToEdit(
  editor: CodeMirror.Editor,
  viewArea: HTMLDivElement,
  { scrollHeights, lineHeights, viewBottom }: HeightData
) {
  const scrollTop = viewArea.scrollTop
  let lineIndex = 0
  for (let i = 0, l = scrollHeights.length; i < l; i++) {
    if (scrollHeights[i] > scrollTop) {
      break
    } else {
      lineIndex = i
    }
  }
  let lineNo = 0
  let lineDiff = 0
  for (let i = 0, l = lineHeights.length; i < l; i++) {
    if (lineHeights[i] > lineIndex) {
      break
    } else {
      lineNo = lineHeights[i]
      lineDiff = lineHeights[i + 1] - lineNo
    }
  }

  let posTo = 0
  let topDiffPercent = 0
  let posToNextDiff = 0
  const scrollInfo = editor.getScrollInfo()
  const textHeight = editor.defaultTextHeight()
  const preLastLineHeight =
    scrollInfo.height - scrollInfo.clientHeight - textHeight
  const preLastLineNo = Math.round(preLastLineHeight / textHeight)
  const preLastLinePos = scrollHeights[preLastLineNo]

  if (
    scrollInfo.height > scrollInfo.clientHeight &&
    scrollTop >= preLastLinePos
  ) {
    posTo = preLastLineHeight
    topDiffPercent =
      (scrollTop - preLastLinePos) / (viewBottom - preLastLinePos)
    posToNextDiff = textHeight * topDiffPercent
    posTo += Math.ceil(posToNextDiff)
  } else {
    posTo = lineNo * textHeight
    topDiffPercent =
      (scrollTop - scrollHeights[lineNo]) /
      (scrollHeights[lineNo + lineDiff] - scrollHeights[lineNo])
    posToNextDiff = textHeight * lineDiff * topDiffPercent
    posTo += Math.ceil(posToNextDiff)
  }

  return posTo
}

export function syncScrollToView(
  editor: CodeMirror.Editor,
  { scrollHeights, viewBottom }: HeightData
) {
  let posTo = 0
  let topDiffPercent = 0
  let posToNextDiff = 0
  const scrollInfo = editor.getScrollInfo()
  const textHeight = editor.defaultTextHeight()
  const lineNo = Math.floor(scrollInfo.top / textHeight)
  const diffToBottom =
    scrollInfo.top + scrollInfo.clientHeight - (scrollInfo.height - textHeight)

  if (scrollInfo.height > scrollInfo.clientHeight && diffToBottom > 0) {
    topDiffPercent = diffToBottom / textHeight
    posTo = scrollHeights[lineNo + 1]
    posToNextDiff = (viewBottom - posTo) * topDiffPercent
    posTo += Math.floor(posToNextDiff)
  } else {
    topDiffPercent = (scrollInfo.top % textHeight) / textHeight
    posTo = scrollHeights[lineNo]
    posToNextDiff = (scrollHeights[lineNo + 1] - posTo) * topDiffPercent
    posTo += Math.floor(posToNextDiff)
  }
  return posTo
}
