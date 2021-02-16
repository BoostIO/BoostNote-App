import React, { useEffect, useState, useRef, useMemo } from 'react'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkShortcodes from 'remark-shortcodes'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeReact from 'rehype-react'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeCodeMirror from '../../../lib/rehypeCodeMirror'
import rehypeSlug from 'rehype-slug'
import styled from '../../../lib/styled'
import { useEffectOnce } from 'react-use'
import { defaultPreviewStyle } from './styles'
import 'katex/dist/katex.min.css'
import { useSettings } from '../../../lib/stores/settings'
import {
  remarkCharts,
  Flowchart,
  rehypeMermaid,
  Chart,
  remarkPlantUML,
} from '../../../lib/charts'
import MarkdownCheckbox from './MarkdownCheckbox'
import { mergeDeepRight } from 'ramda'
import gh from 'hast-util-sanitize/lib/github.json'
import { shortcodeRehypeHandler } from '../../../lib/shortcode'
import Shortcode from '../../molecules/Shortcode'
import LinkableHeader from '../LinkableHeader'
import { rehypePosition } from '../../../lib/rehypePosition'
import remarkDocEmbed, { EmbedDoc } from '../../../lib/docEmbedPlugin'
import { boostHubBaseUrl } from '../../../lib/consts'
import { usingElectron } from '../../../lib/stores/electron'
import { useRouter } from '../../../lib/router'

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': [...gh.attributes['*'], 'className', 'align', 'data-line'],
    input: [...gh.attributes['input'], 'checked'],
    pre: ['dataRaw'],
    shortcode: ['entityId', 'identifier'],
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
    'shortcode',
    'iframe',
  ],
})

type MarkdownViewState =
  | { type: 'loading' }
  | { type: 'loaded'; content: React.ReactNode }
  | { type: 'error'; err: Error }

interface MarkdownViewProps {
  content: string
  customBlockRenderer?: (name: string) => JSX.Element
  updateContent?: (
    newContentOrUpdater: string | ((newValue: string) => string)
  ) => void
  shortcodeHandler?: ({ identifier, entityId }: any) => JSX.Element
  headerLinks?: boolean
  onRender?: () => void
  className?: string
  embeddableDocs?: Map<string, EmbedDoc>
  scrollerRef?: React.RefObject<HTMLDivElement>
}

const MarkdownView = ({
  content,
  updateContent,
  shortcodeHandler,
  headerLinks = true,
  onRender,
  className,
  embeddableDocs,
  scrollerRef,
}: MarkdownViewProps) => {
  const [state, setState] = useState<MarkdownViewState>({ type: 'loading' })
  const modeLoadCallbackRef = useRef<() => any>()
  const { settings } = useSettings()
  const checkboxIndexRef = useRef<number>(0)
  const onRenderRef = useRef(onRender)
  const { push } = useRouter()

  useEffect(() => {
    onRenderRef.current = onRender
  }, [onRender])

  const markdownProcessor = useMemo(() => {
    const linkableHeader = (as: string) => (props: any) => {
      return props.id !== 'user-content-' ? (
        <LinkableHeader as={as} {...props} />
      ) : (
        React.createElement(as, props)
      )
    }
    const rehypeReactConfig: any = {
      createElement: React.createElement,
      Fragment: React.Fragment,
      components: {
        a: ({ href, children }: any) => {
          if (
            (href || '')
              .toLocaleLowerCase()
              .startsWith((boostHubBaseUrl || '').toLocaleLowerCase())
          ) {
            return <a href={href}>{children}</a>
          }

          return (
            <a href={href} target='_blank' rel='noopener noreferrer'>
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
        flowchart: ({ children }: any) => {
          return <Flowchart code={children[0]} />
        },
        chart: ({ children }: any) => {
          return <Chart config={children[0]} />
        },
        'chart(yaml)': ({ children }: any) => {
          return <Chart config={children[0]} isYml={true} />
        },
        shortcode:
          shortcodeHandler == null
            ? ({ identifier, entityId }: any) => {
                return (
                  <Shortcode
                    entity={identifier}
                    id={entityId}
                    original='Unsupported Shortcode'
                  />
                )
              }
            : shortcodeHandler,
      },
    }

    if (headerLinks) {
      rehypeReactConfig.components.h1 = linkableHeader('h1')
      rehypeReactConfig.components.h2 = linkableHeader('h2')
      rehypeReactConfig.components.h3 = linkableHeader('h3')
      rehypeReactConfig.components.h4 = linkableHeader('h4')
      rehypeReactConfig.components.h5 = linkableHeader('h5')
      rehypeReactConfig.components.h6 = linkableHeader('h6')
    }

    const parser = unified()
      .use(remarkParse)
      .use(remarkShortcodes)
      .use(remarkDocEmbed, { contentMap: embeddableDocs })
      .use(remarkMath)
      .use(remarkPlantUML, { server: 'http://www.plantuml.com/plantuml' })
      .use(remarkCharts)
      .use(remarkRehype, {
        allowDangerousHtml: true,
        handlers: {
          shortcode: shortcodeRehypeHandler,
        },
      })
      .use(rehypeRaw)
      .use(rehypeSlug)
      .use(rehypePosition)
      .use(rehypeSanitize, schema)
      .use(rehypeKatex)
      .use(rehypeCodeMirror, {
        ignoreMissing: true,
        theme: settings['general.codeBlockTheme'],
      })
      .use(rehypeMermaid)
      .use(rehypeReact, rehypeReactConfig)

    return parser
  }, [settings, updateContent, shortcodeHandler, headerLinks, embeddableDocs])

  useEffect(() => {
    const renderContentCallback = async () => {
      try {
        checkboxIndexRef.current = 0
        const result = (await markdownProcessor.process(content)) as any
        setState({
          type: 'loaded',
          content: result.result,
        })
        document.querySelectorAll('.collapse-trigger').forEach((trigger) => {
          trigger.addEventListener('click', triggerCollapse)
        })
        document
          .querySelectorAll('.doc-embed-header a')
          .forEach((docEmbedLink) => {
            docEmbedLink.addEventListener('click', (event) => {
              if (
                ((event as MouseEvent).ctrlKey ||
                  (event as MouseEvent).metaKey) &&
                !usingElectron
              ) {
                return
              }

              event.preventDefault()
              push((event.target as HTMLAnchorElement).href)
            })
          })
        if (onRenderRef.current != null) {
          onRenderRef.current()
        }
      } catch (err) {
        setState({ type: 'error', err })
      }
    }
    modeLoadCallbackRef.current = renderContentCallback
    renderContentCallback()
  }, [content, markdownProcessor, push])

  useEffectOnce(() => {
    const callback = () => {
      if (modeLoadCallbackRef.current != null) {
        modeLoadCallbackRef.current()
      }
    }
    window.addEventListener('codemirror-mode-load', callback)
    return () => {
      window.removeEventListener('codemirror-mode-load', callback)
    }
  })

  const displayContent = useMemo(() => {
    switch (state.type) {
      case 'loading':
        return 'loading...'
      case 'error':
        return 'On no! An error occured while parsing the document!'
      case 'loaded':
        return state.content
    }
  }, [state])

  return (
    <StyledMarkdownPreview className={className} ref={scrollerRef}>
      {displayContent}
    </StyledMarkdownPreview>
  )
}

function triggerCollapse(event: Event) {
  if (event.target != null && event.target instanceof Element) {
    const parent = event.target.closest('.doc-embed')
    if (parent != null) {
      parent.classList.toggle('collapsed')
    }
  }
}

const StyledMarkdownPreview = styled.div`
  ${defaultPreviewStyle}
  padding: 0 ${({ theme }) => theme.space.xsmall}px ${({ theme }) =>
  theme.space.xxxlarge}px;
`

export default MarkdownView
