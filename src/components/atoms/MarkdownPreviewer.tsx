import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import unified, { Plugin } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeReact from 'rehype-react'
import gh from 'hast-util-sanitize/lib/github.json'
import { mergeDeepRight } from 'ramda'
import visit from 'unist-util-visit'
import { Node, Parent } from 'unist'
import CodeMirror from '../../lib/CodeMirror'
import h from 'hastscript'
import useForceUpdate from 'use-force-update'
import styled from '../../lib/styled'
import cc from 'classcat'
import { useDb } from '../../lib/db'
import { openNew } from '../../lib/utils/platform'

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': ['className'],
    input: ['checked']
  }
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
  return function(tree: Node) {
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
                    : undefined
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
  storageId?: string
}

const MarkdownPreviewer = ({
  content,
  codeBlockTheme,
  style,
  theme,
  storageId
}: MarkdownPreviewerProps) => {
  const forceUpdate = useForceUpdate()
  const [rendering, setRendering] = useState(false)
  const previousContentRef = useRef('')
  const previousThemeRef = useRef<string | undefined>('')
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>([])
  const { storageMap } = useDb()

  const markdownProcessor = useMemo(() => {
    const options = { codeBlockTheme, storageId }

    return unified()
      .use(remarkParse)
      .use(remarkRehype, { allowDangerousHTML: false })
      .use(rehypeCodeMirror, {
        ignoreMissing: true,
        theme: options.codeBlockTheme
      })
      .use(rehypeRaw)
      .use(rehypeSanitize, schema)
      .use(rehypeReact, {
        createElement: React.createElement,
        components: {
          img: ({ src, ...props }: any) => {
            const storage = storageMap[options.storageId!]

            if (storage != null && src != null && !src.match('/')) {
              const attachment = storage.attachmentMap[src]
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
                onClick={event => {
                  event.preventDefault()
                  openNew(href)
                }}
              >
                {children}
              </a>
            )
          }
        }
      })
  }, [codeBlockTheme, storageId, storageMap])

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
