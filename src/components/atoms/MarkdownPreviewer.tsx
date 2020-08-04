import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import unified, { Plugin } from 'unified'
import remarkEmoji from 'remark-emoji'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeReact from 'rehype-react'
import rehypeKatex from 'rehype-katex'
import gh from 'hast-util-sanitize/lib/github.json'
import { mergeDeepRight } from 'ramda'
import visit from 'unist-util-visit'
import { Node, Parent } from 'unist'
import CodeMirror from '../../lib/CodeMirror'
import h from 'hastscript'
import styled from '../../lib/styled'
import cc from 'classcat'
import { openNew } from '../../lib/platform'
import { Attachment, ObjectMap } from '../../lib/db/types'
import 'katex/dist/katex.min.css'
import MarkdownCheckbox from './markdown/MarkdownCheckbox'
import AttachmentImage from './markdown/AttachmentImage'
import CodeFence from './markdown/CodeFence'

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': [...gh.attributes['*'], 'className', 'align'],
    input: [...gh.attributes.input, 'checked'],
    pre: ['dataRaw'],
  },
})

interface Element extends Parent {
  type: 'element'
  properties: { [key: string]: any }
}

function getMime(name: string) {
  const modeInfo = CodeMirror.findModeByName(name)
  if (modeInfo == null) return null
  return modeInfo.mime || modeInfo.mimes![0]
}

interface RehypeCodeMirrorOptions {
  ignoreMissing: boolean
  plainText: string[]
  theme: string
}

function isElement(node: Node | undefined, tagName: string): node is Element {
  if (node == null) {
    return false
  }
  return node.tagName === tagName
}

function rehypeCodeMirrorAttacher(options: Partial<RehypeCodeMirrorOptions>) {
  const settings = options || {}
  const ignoreMissing = settings.ignoreMissing || false
  const theme = settings.theme || 'default'
  const plainText = settings.plainText || []
  return function (tree: Node) {
    visit<Element>(tree, 'element', visitor)

    return tree

    function visitor(node: Element, _index: number, parent?: Node) {
      if (!isElement(parent, 'pre') || !isElement(node, 'code')) {
        return
      }

      const lang = language(node)

      const classNames =
        parent.properties.className != null
          ? [...parent.properties.className]
          : []
      if (theme === 'solarized-dark') {
        classNames.push(`cm-s-solarized`, `cm-s-dark`, 'CodeMirror')
      } else {
        classNames.push(`cm-s-${theme}`, 'CodeMirror')
      }
      if (lang != null) {
        classNames.push('language-' + lang)
      }
      parent.properties.className = classNames

      if (lang == null || lang === false || plainText.indexOf(lang) !== -1) {
        return
      }

      const rawContent = node.children[0].value as string
      // TODO: Stop using html attribute after exposing HAST Node is shipped
      parent.properties['data-raw'] = rawContent

      const cmResult = [] as Node[]
      if (lang != null) {
        const mime = getMime(lang)
        if (mime != null) {
          CodeMirror.runMode(rawContent, mime, (text, style) => {
            cmResult.push(
              h(
                'span',
                {
                  className: style
                    ? 'cm-' + style.replace(/ +/g, ' cm-')
                    : undefined,
                },
                text
              )
            )
          })
        } else if (!ignoreMissing) {
          throw new Error(`Unknown language: \`${lang}\` is not registered`)
        }
      }

      node.children = cmResult
    }

    // Get the programming language of `node`.
    function language(node: Element) {
      const className = node.properties.className || []
      const length = className.length
      let index = -1
      let value

      while (++index < length) {
        value = className[index]

        if (value === 'no-highlight' || value === 'nohighlight') {
          return false
        }

        if (value.slice(0, 5) === 'lang-') {
          return value.slice(5)
        }

        if (value.slice(0, 9) === 'language-') {
          return value.slice(9)
        }
      }

      return null
    }
  }
}

export const rehypeCodeMirror = rehypeCodeMirrorAttacher as Plugin<
  [Partial<RehypeCodeMirrorOptions>?]
>

interface MarkdownPreviewerProps {
  content: string
  codeBlockTheme?: string
  style?: string
  theme?: string
  attachmentMap?: ObjectMap<Attachment>
  updateContent?: (
    newContentOrUpdater: string | ((newValue: string) => string)
  ) => void
}

const MarkdownPreviewer = ({
  content,
  codeBlockTheme,
  style,
  theme,
  attachmentMap = {},
  updateContent,
}: MarkdownPreviewerProps) => {
  const [rendering, setRendering] = useState(false)
  const previousContentRef = useRef('')
  const previousThemeRef = useRef<string | undefined>('')
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>([])

  const checkboxIndexRef = useRef<number>(0)

  const markdownProcessor = useMemo(() => {
    return unified()
      .use(remarkParse)
      .use(remarkEmoji, { emoticon: false })
      .use([remarkRehype, { allowDangerousHTML: true }])
      .use(rehypeRaw)
      .use(rehypeSanitize, schema)
      .use(remarkMath)
      .use(rehypeCodeMirror, {
        ignoreMissing: true,
        theme: codeBlockTheme,
      })
      .use(rehypeKatex)
      .use(rehypeReact, {
        createElement: React.createElement,
        components: {
          img: ({ src, ...props }: any) => {
            if (src != null && !src.match('/')) {
              const attachment = attachmentMap[src]
              if (attachment != null) {
                return <AttachmentImage attachment={attachment} />
              }
            }

            return <img {...props} src={src} />
          },
          a: ({ href, children }: any) => {
            return (
              <a
                href={href}
                onClick={(event) => {
                  event.preventDefault()
                  openNew(href)
                }}
              >
                {children}
              </a>
            )
          },
          input: (props: React.HTMLProps<HTMLInputElement>) => {
            const { type, checked } = props

            if (type !== 'checkbox') {
              return <input {...props} />
            }

            return (
              <MarkdownCheckbox
                index={checkboxIndexRef.current++}
                checked={checked}
                updateContent={updateContent}
              />
            )
          },
          pre: CodeFence,
        },
      })
  }, [codeBlockTheme, attachmentMap, updateContent])

  const renderContent = useCallback(async () => {
    const content = previousContentRef.current
    setRendering(true)

    console.time('render')
    checkboxIndexRef.current = 0
    const result = await markdownProcessor.process(content)
    console.timeEnd('render')

    setRendering(false)
    setRenderedContent((result as any).result)
  }, [markdownProcessor])

  useEffect(() => {
    window.addEventListener('codemirror-mode-load', renderContent)
    return () => {
      window.removeEventListener('codemirror-mode-load', renderContent)
    }
  }, [renderContent])

  useEffect(() => {
    console.log('render requested')
    if (
      (previousThemeRef.current === codeBlockTheme &&
        previousContentRef.current === content) ||
      rendering
    ) {
      return
    }
    console.log('rendering...')
    previousContentRef.current = content
    previousThemeRef.current = codeBlockTheme
    renderContent()
  }, [content, codeBlockTheme, rendering, renderContent, renderedContent])

  const StyledContainer = useMemo(() => {
    return styled.div`
      .CodeMirror {
        height: inherit;
      }
      ${style}
    `
  }, [style])

  return (
    <StyledContainer className='MarkdownPreviewer' tabIndex='0'>
      <div className={cc([theme])}>
        {rendering && 'rendering...'}
        {renderedContent}
      </div>
    </StyledContainer>
  )
}

export default MarkdownPreviewer
