import prettier from 'prettier/standalone'
import parserMarkdown from 'prettier/parser-markdown'

export type MarkdownFormatResult = {
  formatted: string
  cursorOffset: number
}

export function formatMarkdown(
  source: string,
  cursorOffset: number
): MarkdownFormatResult {
  const result = prettier.formatWithCursor(source, {
    parser: 'markdown',
    plugins: [parserMarkdown],
    proseWrap: 'always',
    printWidth: 80,
    cursorOffset,
  })

  return keepOriginalFinalNewline(source, result.formatted, result.cursorOffset)
}

function keepOriginalFinalNewline(
  source: string,
  formatted: string,
  cursorOffset: number
): MarkdownFormatResult {
  if (/\r?\n$/.test(source) || !/\r?\n$/.test(formatted)) {
    return { formatted, cursorOffset }
  }

  const stripped = formatted.replace(/\r?\n$/, '')

  return {
    formatted: stripped,
    cursorOffset: Math.min(cursorOffset, stripped.length),
  }
}
