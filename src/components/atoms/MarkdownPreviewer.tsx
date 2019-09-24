import React, { useEffect } from 'react'
import unified from 'unified'
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
import toText from 'hast-util-to-text'
import h from 'hastscript'
import useForceUpdate from 'use-force-update'

const schema = mergeDeepRight(gh, { attributes: { '*': ['className'] } })

interface Element extends Node {
  type: 'element'
  properties: { [key: string]: any }
}

function getMime(name: string) {
  const modeInfo = CodeMirror.findModeByName(name)
  if (modeInfo == null) return null
  return modeInfo.mime || modeInfo.mimes![0]
}

const markdownProcessor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHTML: false })
  .use((options: any) => {
    const settings = options || {}
    const detect = settings.subset !== false
    const ignoreMissing = settings.ignoreMissing
    const plainText = settings.plainText || []
    return function(tree: Parent) {
      visit<Element>(tree, 'element', visitor)

      function visitor(node: Element, _index: number, parent: Node) {
        const props = node.properties
        let result

        if (!parent || parent.tagName !== 'pre' || node.tagName !== 'code') {
          return
        }

        const lang = language(node)

        if (
          lang === false ||
          (!lang && !detect) ||
          plainText.indexOf(lang) !== -1
        ) {
          return
        }

        if (!props.className) {
          props.className = []
        }

        if (props.className.indexOf(name) === -1) {
          props.className.unshift(name)
        }

        try {
          const text = toText(parent)
          const cmResult = [] as Node[]
          if (lang != null) {
            const mime = getMime(lang)
            if (mime != null) {
              CodeMirror.runMode(text, mime, (text, style) => {
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
            }
          }
          result = {
            language: lang,
            value: cmResult
          }
        } catch (error) {
          if (
            error &&
            ignoreMissing &&
            /Unknown language/.test(error.message)
          ) {
            return
          }

          throw error
        }

        props.className.push('cm-s-default')
        if (!lang && result.language) {
          props.className.push('language-' + result.language)
        }

        node.children = result.value
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
  })
  .use(rehypeRaw)
  .use(rehypeSanitize, schema)
  .use(rehypeReact, { createElement: React.createElement })

interface MarkdownPreviewerProps {
  content: string
}

const MarkdownPreviewer = ({ content }: MarkdownPreviewerProps) => {
  const forceUpdate = useForceUpdate()
  const [rendering, setRendering] = useState(false)
  const previousContentRef = useRef('')
  const [renderedContent, setRenderedContent] = useState<React.ReactNode>([])

  const renderContent = useCallback(async (content: string) => {
    previousContentRef.current = content
    setRendering(true)

    console.time('render')
    const result = await markdownProcessor.process(content)
    console.timeEnd('render')

    setRendering(false)
    setRenderedContent(result.contents)
  }, [])

  useEffect(() => {
    window.addEventListener('codemirror-mode-load', forceUpdate)
    return () => {
      window.removeEventListener('codemirror-mode-load', forceUpdate)
    }
  }, [forceUpdate])

  useEffect(() => {
    if (previousContentRef.current === content || rendering) {
      return
    }
    renderContent(content)
  }, [content, rendering, renderContent, renderedContent])

  return (
    <div>
      {rendering && 'rendering...'}
      {renderedContent}
    </div>
  )

  return <div>{markdownProcessor.processSync(content).contents}</div>
}

export default MarkdownPreviewer
