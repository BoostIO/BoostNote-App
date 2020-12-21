import { NoteDoc } from '../db/types'
import { EditorPosition } from '../CodeMirror'

export interface SearchResult {
  id: string
  lineStr: string
  matchStr: string
  matchColumn: number
  matchLength: number
  lineNum: number
}

export interface NoteSearchData {
  results: SearchResult[]
  note: NoteDoc
}

const SEARCH_MEGABYTES_PER_NOTE = 30
export const MAX_SEARCH_PREVIEW_LINE_LENGTH = 10000
export const MAX_SEARCH_CONTENT_LENGTH_PER_NOTE =
  SEARCH_MEGABYTES_PER_NOTE * 10e6
export const SEARCH_DEBOUNCE_TIMEOUT = 350
export const MERGE_SAME_LINE_RESULTS_INTO_ONE = true

export function getSearchResultKey(noteId: string, searchItemId: string) {
  return `${noteId}${searchItemId}`
}

function getMatchDataFromGlobalColumn(
  lines: string[],
  position: number
): EditorPosition {
  let currentPosition = 0
  let lineColumn = 0
  let lineNum = 0

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    currentPosition += lines[lineIndex].length + 1
    if (currentPosition > position) {
      lineNum = lineIndex
      lineColumn = position - (currentPosition - (lines[lineIndex].length + 1))
      break
    }
  }
  return {
    line: lineNum,
    ch: lineColumn,
  }
}

export function getMatchData(text: string, searchTerm: RegExp) {
  const data: SearchResult[] = []

  // Split text
  let resultId = 0
  const lines: string[] = text.split('\n')

  // Use only first N lines
  if (text.length > MAX_SEARCH_CONTENT_LENGTH_PER_NOTE) {
    text = text.substring(0, MAX_SEARCH_PREVIEW_LINE_LENGTH)
  }
  const matches: IterableIterator<RegExpMatchArray> = text.matchAll(searchTerm)

  let previousLineNumber = -1
  for (const match of matches) {
    const matchStr = match[0]
    const matchIndex: number = match.index ? match.index : 0
    const pos = getMatchDataFromGlobalColumn(lines, matchIndex)
    if (MERGE_SAME_LINE_RESULTS_INTO_ONE) {
      if (pos.line == previousLineNumber) {
        continue
      } else {
        previousLineNumber = pos.line
      }
    }
    data.push({
      id: `${resultId++}`,
      lineStr: lines[pos.line],
      lineNum: pos.line + 1,
      matchLength: matchStr.length,
      matchColumn: pos.ch,
      matchStr: matchStr,
    })
  }
  return data
}
