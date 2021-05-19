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
import SelectionTooltip from '../SelectionTooltip'
import useSelectionLocation, {
  Rect,
} from '../../../lib/selection/useSelectionLocation'
import rehypeHighlight, { HighlightRange } from '../../../lib/rehypeHighlight'
import rehypeGutters from '../../../lib/rehypeGutters'
import { Node as UnistNode } from 'unist'
import { mdiCommentTextOutline } from '@mdi/js'
import Icon from '../../../../shared/components/atoms/Icon'
import styled from '../../../../shared/lib/styled'
import {
  highlightComment,
  unhighlightComment,
} from '../../../../shared/lib/utils/comments'

const schema = mergeDeepRight(gh, {
  attributes: {
    '*': [
      ...gh.attributes['*'],
      'className',
      'align',
      'data-line',
      'data-offset',
      'data-inline-comment',
    ],
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
    'gutter',
  ],
})

type MarkdownViewState =
  | { type: 'loading' }
  | { type: 'loaded'; content: React.ReactNode }
  | { type: 'error'; err: Error }

export interface SelectionContext {
  start: number
  end: number
  text: string
}

interface SelectionState {
  context: SelectionContext
  position: Rect
  selection: Selection
}

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
  SelectionMenu?: React.ComponentType<{ selection: SelectionState['context'] }>
  comments?: HighlightRange[]
  commentClick?: (id: string) => void
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
  SelectionMenu,
  comments,
  commentClick,
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
        comment_icon: (props: any) => {
          const id = props['data-comment']
          return id != null ? (
            <div
              className='comment__icon'
              onClick={() => commentClick && commentClick(id)}
              onMouseOver={highlightComment(id)}
              onMouseOut={unhighlightComment(id)}
            >
              <Icon path={mdiCommentTextOutline} size={20} />
            </div>
          ) : undefined
        },
        comment_count: (props: any) => {
          return props.count != null ? (
            <div className='comment__count'>
              <Icon path={mdiCommentTextOutline} /> {props.count}
            </div>
          ) : undefined
        },
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
      .use(rehypeSanitize, schema)
      .use(rehypeKatex)
      .use(rehypeCodeMirror, {
        ignoreMissing: true,
        theme: settings['general.codeBlockTheme'],
      })
      .use(rehypeMermaid)
      .use(rehypeHighlight, comments || [])
      .use(rehypeGutters, makeCommentGutters(comments || []))
      .use(rehypePosition)
      .use(rehypeReact, rehypeReactConfig)

    return parser
  }, [
    settings,
    updateContent,
    shortcodeHandler,
    headerLinks,
    embeddableDocs,
    comments,
    commentClick,
  ])

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

  const defaultRef = useRef<HTMLElement>(null)
  const selectionInfo = useSelectionLocation(scrollerRef || defaultRef)
  const [selectionState, setSelectionState] = useState<SelectionState | null>(
    null
  )

  useEffect(() => {
    if (
      selectionInfo.selection.type === 'none' ||
      selectionInfo.location == null ||
      selectionInfo.location.local == null
    ) {
      setSelectionState(null)
    } else {
      const context = getSelectionContext(selectionInfo.selection.selection)
      if (context != null) {
        setSelectionState({
          position: selectionInfo.location.local,
          context,
          selection: selectionInfo.selection.selection,
        })
      }
    }
  }, [selectionInfo])

  return (
    <StyledMarkdownPreview
      className={className}
      ref={scrollerRef || defaultRef}
    >
      {displayContent}
      {selectionState != null && SelectionMenu && (
        <SelectionTooltip rect={selectionState.position}>
          <StyledTooltipContent>
            <SelectionMenu selection={selectionState.context} />
          </StyledTooltipContent>
        </SelectionTooltip>
      )}
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

function getSelectionContext(
  selection: Selection
): SelectionState['context'] | null {
  const anchor = selection.anchorNode
  const focus = selection.focusNode
  if (anchor == null || focus == null) return null
  if (!anchor.TEXT_NODE || !focus.TEXT_NODE) return null
  const offset1 = getOffset(anchor)
  const offset2 = getOffset(focus)
  if (offset1 == null || offset2 == null) return null

  const rangeStart = offset1 + selection.anchorOffset
  const rangeEnd = offset2 + selection.focusOffset
  return {
    start: Math.min(rangeStart, rangeEnd),
    end: Math.max(rangeStart, rangeEnd),
    text: selection.toString(),
  }
}

function getOffset(node: Node) {
  const nonTextNode = node.TEXT_NODE ? node.parentElement : node
  if (nonTextNode == null || !isElement(nonTextNode)) return null
  const offset = parseInt(nonTextNode.getAttribute('data-offset') || '', 10)
  return isNaN(offset) ? null : offset
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1
}

const StyledMarkdownPreview = styled.div`
  position: relative;
  ${defaultPreviewStyle}
  padding: 0 ${({ theme }) => theme.sizes.spaces.md}px ${({ theme }) =>
  theme.sizes.spaces.xl}px;

  .block__gutter {
    position: absolute;
    left: 100%;
    top: 0;
    max-width: 40px;
  }

  .with__gutter {
    position: relative;
    &:hover .comment__icon {
      display: block;
    }

    &:hover .comment__count {
      display: none;
    }
  }

  .comment__icon {
    display: none;
    color: ${({ theme }) => theme.colors.text.subtle}
    &:hover {
      color: ${({ theme }) => theme.colors.text.primary}
    }
  }

  .comment__count {
    display: flex;
    color: ${({ theme }) => theme.colors.icon.default} 
  }
`

const StyledTooltipContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.second};
  border-radius: ${({ theme }) => theme.borders.radius}px;
  max-height: 50px;
`

function makeCommentGutters(highlights: HighlightRange[]) {
  return (node: UnistNode): UnistNode | null => {
    const posStart = node.position?.start.offset
    const posEnd = node.position?.end.offset
    if (posStart != null && posEnd != null) {
      const allHighlights = highlights.filter(
        (highlight) => highlight.start >= posStart && highlight.start <= posEnd
      )
      if (allHighlights.length > 0) {
        const links = allHighlights.map((hi) => ({
          type: 'element',
          tagName: 'comment_icon',
          properties: {
            'data-comment': hi.id,
          },
        }))
        return {
          type: 'element',
          tagName: 'div',
          children: [
            {
              type: 'element',
              tagName: 'comment_count',
              properties: {
                count: allHighlights.length,
              },
            },
            ...links,
          ],
        }
      }
    }
    return null
  }
}

export default MarkdownView
