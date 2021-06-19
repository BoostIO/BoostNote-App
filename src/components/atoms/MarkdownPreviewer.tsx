import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import unified from 'unified'
import remarkEmoji from 'remark-emoji'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import remarkSlug from 'remark-slug'
import remarkMath from 'remark-math'
import remarkAdmonitions from 'remark-admonitions'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeReact from 'rehype-react'
import rehypeKatex from 'rehype-katex'
import gh from 'hast-util-sanitize/lib/github.json'
import { mergeDeepRight } from 'ramda'
import cc from 'classcat'
import { openNew } from '../../lib/platform'
import { Attachment, ObjectMap } from '../../lib/db/types'
import MarkdownCheckbox from './markdown/MarkdownCheckbox'
import AttachmentImage from './markdown/AttachmentImage'
import CodeFence from '../../shared/components/atoms/markdown/CodeFence'
import {
  Chart,
  Flowchart,
  rehypeMermaid,
  remarkCharts,
  remarkPlantUML,
} from '../../cloud/lib/charts'
import { rehypePosition } from '../../cloud/lib/rehypePosition'
import styled from '../../shared/lib/styled'
import rehypeCodeMirror from '../../shared/lib/codemirror/rehypeCodeMirror'

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': [...gh.attributes['*'], 'className', 'align', 'data-line'],
    input: [...gh.attributes.input, 'checked'],
    pre: ['dataRaw'],
    iframe: ['src'],
    path: ['d'],
    svg: ['viewBox'],
  },
  tagNames: [
    ...gh.tagNames,
    'svg',
    'path',
    'mermaid',
    'flowchart',
    'chart',
    'chart(yaml)',
    'iframe',
  ],
})

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

  const remarkAdmonitionOptions = {
    tag: ':::',
    icons: 'emoji',
    infima: false,
  }

  const rehypeReactConfig = {
    createElement: React.createElement,
    Fragment: React.Fragment,
    components: {
      img: ({ src, ...props }: any) => {
        if (src != null && !src.match('/')) {
          const attachment = attachmentMap[src]
          if (attachment != null) {
            return <AttachmentImage attachment={attachment} {...props} />
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
      flowchart: ({ children }: any) => {
        return <Flowchart code={children[0]} />
      },
      chart: ({ children }: any) => {
        return <Chart config={children[0]} />
      },
      'chart(yaml)': ({ children }: any) => {
        return <Chart config={children[0]} isYml={true} />
      },
    },
  }

  const markdownProcessor = useMemo(() => {
    return unified()
      .use(remarkParse)
      .use(remarkEmoji, { emoticon: false })
      .use(remarkAdmonitions, remarkAdmonitionOptions)
      .use(remarkMath)
      .use(remarkPlantUML, { server: 'http://www.plantuml.com/plantuml' })
      .use(remarkCharts)
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(remarkSlug)
      .use(rehypePosition)
      .use(rehypeSanitize, schema)
      .use(rehypeKatex)
      .use(rehypeCodeMirror, {
        ignoreMissing: true,
        theme: codeBlockTheme,
      })
      .use(rehypeMermaid)
      .use(rehypeReact, rehypeReactConfig)
  }, [remarkAdmonitionOptions, codeBlockTheme, rehypeReactConfig])

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
