import { readAsText } from './utils/files'
import { parse } from 'cson-parser'
import ow from 'ow'

type ParseErrors = 'read_error' | 'parse_error' | 'not_markdown'
type ParsedNote = {
  content: string
  tags: string[]
  title: string
}
type ConvertResult =
  | { err: true; data: ParseErrors }
  | { err: false; data: ParsedNote }

export const convertCSONFileToNote = async (
  file: File
): Promise<ConvertResult> => {
  const text = await readFile(file)

  if (text === 'read_error') {
    return { err: true, data: text }
  }

  const parsed = await parseCSON(text)

  if (parsed === 'parse_error') {
    return { err: true, data: parsed }
  }

  const validated = validateNoteSchema(parsed)

  if (validated === 'parse_error') {
    return { err: true, data: validated }
  }

  const { type, content, title, tags } = validated

  if (type !== 'MARKDOWN_NOTE') {
    return { err: true, data: 'not_markdown' }
  }

  return { err: false, data: { content, title, tags } }
}

const readFile = (file: File) => readAsText(file).catch(() => 'read_error')

const parseCSON = (text: string) => {
  try {
    return parse(text)
  } catch {
    return 'parse_error'
  }
}

const validateNoteSchema = (
  obj: any
): ParsedNote & { type: string } | 'parse_error' => {
  const validator = ow.object.partialShape({
    tags: ow.optional.array.ofType(ow.string),
    content: ow.string,
    title: ow.string,
    type: ow.string
  })

  try {
    ow(obj, validator)
    return obj
  } catch (e) {
    console.log(e)
    return 'parse_error'
  }
}
