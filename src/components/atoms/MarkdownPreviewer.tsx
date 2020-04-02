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
import useForceUpdate from 'use-force-update'
import styled from '../../lib/styled'
import cc from 'classcat'
import { openNew } from '../../lib/platform'
import { Attachment, ObjectMap } from '../../lib/db/types'
import 'katex/dist/katex.min.css'

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': ['className'],
    input: ['checked'],
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

function isElement(node: Node, tagName: string): node is Element {
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

    function visitor(node: Element, _index: number, parent: Node) {
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

const BlobImage = ({ blob, ...props }: any) => {
  const url = useMemo(() => {
    return URL.createObjectURL(blob)
  }, [blob])
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [blob, url])
  return <img src={url} {...props} />
}

interface MarkdownPreviewerProps {
  content: string
  codeBlockTheme?: string
  style?: string
  theme?: string
  attachmentMap?: ObjectMap<Attachment>
  updateContent: (newValue: string) => void
}

const MarkdownPreviewer = ({
  content,
  codeBlockTheme,
  style,
  theme,
  attachmentMap = {},
  updateContent,
}: MarkdownPreviewerProps) => {
  const forceUpdate = useForceUpdate()
  const [rendering, setRendering] = useState(false)
  const previousContentRef = useRef('')
  const previousThemeRef = useRef<string | undefined>('')
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>([])

  const markdownProcessor = useMemo(() => {
    const options = { codeBlockTheme }
    let checkboxIndexes = 0

    const renderInput = (props: React.HTMLProps<HTMLInputElement>) => {
      const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const lines = content.split('\n')
        const id = e.target.getAttribute('id')
        if (id === null) return
        const checkboxIndex = Number(id.replace(/^checkbox|(\[|\])/gi, ''))

        let current = 0

        for (let index = 0; index < lines.length; index++) {
          const line = lines[index]
          // Matches both checked + unchecked
          const matches = line.match(/^(\s*>?)*\s*[+\-*] (\[x]|\[ ])/i)
          if (matches) {
            if (current === checkboxIndex) {
              const isChecked = /^(\s*>?)*\s*[+\-*] \[x]/i.test(matches[0])
              lines[index] = line.replace(
                isChecked ? '[x]' : '[ ]',
                isChecked ? '[ ]' : '[x]'
              )
              // Bail out early since we're done
              break
            } else {
              current++
            }
          }
        }
        updateContent(lines.join('\n'))
      }
      return (
        <input
          onChange={onChange}
          id={`checkbox[${checkboxIndexes++}]`}
          readOnly
          {...props}
          disabled={props.type !== 'checkbox'}
        />
      )
    }

    return unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHTML: false })
      .use(remarkMath)
      .use(rehypeCodeMirror, {
        ignoreMissing: true,
        theme: options.codeBlockTheme,
      })
      .use(rehypeRaw)
      .use(rehypeSanitize, schema)
      .use(rehypeKatex)
      .use(remarkEmoji, { emoticon: true })
      .use(rehypeReact, {
        createElement: React.createElement,
        components: {
          img: ({ src, ...props }: any) => {
            if (src != null && !src.match('/')) {
              const attachment = attachmentMap[src]
              if (attachment != null) {
                return <BlobImage blob={attachment.blob} />
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
          input: renderInput,
        },
      })
  }, [codeBlockTheme, attachmentMap, content, updateContent])

  const renderContent = useCallback(
    async (content: string) => {
      previousContentRef.current = content
      previousThemeRef.current = codeBlockTheme
      setRendering(true)

      console.time('render')
      const result = await markdownProcessor.process(content)
      console.timeEnd('render')

      setRendering(false)
      setRenderedContent(result.contents)
    },
    [codeBlockTheme, markdownProcessor]
  )

  useEffect(() => {
    window.addEventListener('codemirror-mode-load', forceUpdate)
    return () => {
      window.removeEventListener('codemirror-mode-load', forceUpdate)
    }
  }, [forceUpdate])

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
    renderContent(content)
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
    <StyledContainer className='MarkdownPreviewer'>
      <div className={cc([theme])}>
        {rendering && 'rendering...'}
        {renderedContent}
      </div>
    </StyledContainer>
  )
}

export default MarkdownPreviewer
