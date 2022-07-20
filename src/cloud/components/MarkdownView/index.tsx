import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkShortcodes from 'remark-shortcodes'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import rehypeReact from 'rehype-react'
import remarkAdmonitions from 'remark-admonitions'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeCodeMirror from '../../../design/lib/codemirror/rehypeCodeMirror'
import rehypeSlug from 'rehype-slug'
import { useEffectOnce } from 'react-use'
import { CodeMirrorEditorTheme } from '../../lib/stores/settings'
import {
  remarkCharts,
  Flowchart,
  rehypeMermaid,
  Chart,
  remarkPlantUML,
  FlowchartWarningBlock,
} from '../../lib/charts'
import MarkdownCheckbox from './MarkdownCheckbox'
import { mergeDeepRight } from 'ramda'
import gh from 'hast-util-sanitize/lib/github.json'
import { shortcodeRehypeHandler } from '../../lib/shortcode'
import Shortcode from './Shortcode'
import LinkableHeader from './LinkableHeader'
import { rehypePosition } from '../../lib/rehypePosition'
import remarkDocEmbed, { EmbedDoc } from '../../lib/docEmbedPlugin'
import { boostHubBaseUrl } from '../../lib/consts'
import {
  openInBrowser,
  useElectron,
  usingElectron,
} from '../../lib/stores/electron'
import { useRouter } from '../../lib/router'
import SelectionTooltip from './SelectionTooltip'
import useSelectionLocation, {
  Rect,
} from '../../lib/selection/useSelectionLocation'
import styled from '../../../design/lib/styled'
import throttle from 'lodash.throttle'
import CodeFence from '../../../design/components/atoms/markdown/CodeFence'
import { agentType, sendPostMessage } from '../../../mobile/lib/nativeMobile'
import { TableOfContents } from './TableOfContents'
import ExpandableImage from '../../../design/components/molecules/Image/ExpandableImage'
import { defaultPreviewStyle } from './styles'
import LoaderDocEditor from '../../../design/components/atoms/loaders/LoaderDocEditor'
import { lngKeys } from '../../lib/i18n/types'
import { DialogIconTypes, useDialog } from '../../../design/lib/stores/dialog'
import { useI18n } from '../../lib/hooks/useI18n'

const remarkAdmonitionOptions = {
  tag: ':::',
  icons: 'emoji',
  infima: false,
}

export const schema = mergeDeepRight(gh, {
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

export interface SelectionState {
  context: SelectionContext
  position: Rect
  selection: Selection
}

interface MarkdownViewProps {
  content: string
  customBlockRenderer?: (name: string) => JSX.Element
  updateContent?: (
    newContentOrUpdater: string | ((newValue: string) => string),
    refocusEditorAndCursor?: boolean
  ) => void
  shortcodeHandler?: ({ identifier, entityId }: any) => JSX.Element
  headerLinks?: boolean
  onRender?: () => void
  className?: string
  getEmbed?: (
    id: string
  ) => Promise<EmbedDoc | undefined> | EmbedDoc | undefined
  scrollerRef?: React.RefObject<HTMLDivElement>
  SelectionMenu?: React.ComponentType<{ selection: SelectionState['context'] }>
  codeFence?: boolean
  previewStyle?: string
  codeBlockTheme?: CodeMirrorEditorTheme
  showLinkOpenWarning?: boolean
}

const MarkdownView = ({
  content,
  updateContent,
  shortcodeHandler,
  headerLinks = true,
  onRender,
  className,
  getEmbed,
  scrollerRef,
  SelectionMenu,
  codeFence = true,
  previewStyle,
  codeBlockTheme = 'default',
  showLinkOpenWarning = false,
}: MarkdownViewProps) => {
  const [state, setState] = useState<MarkdownViewState>({ type: 'loading' })
  const modeLoadCallbackRef = useRef<() => any>()
  const checkboxIndexRef = useRef<number>(0)
  const onRenderRef = useRef(onRender)
  const { push } = useRouter()
  const { translate } = useI18n()
  const { messageBox } = useDialog()
  const { sendToElectron } = useElectron()

  useEffect(() => {
    onRenderRef.current = onRender
  }, [onRender])

  const openLinkWithWarning = useCallback(
    (callback) => {
      if (!showLinkOpenWarning) {
        callback()
        return
      }
      messageBox({
        title: 'Opening an attachment link',
        message:
          "The attachment might include malicious data. If you don't trust authors of this shared docs, please do NOT open it.",
        iconType: DialogIconTypes.Warning,
        buttons: [
          {
            variant: 'secondary',
            label: translate(lngKeys.GeneralCancel),
            cancelButton: true,
            defaultButton: true,
          },
          {
            variant: 'danger',
            label: translate(lngKeys.GeneralOpenVerb),
            onClick: async () => {
              callback()
            },
          },
        ],
      })
    },
    [messageBox, showLinkOpenWarning, translate]
  )

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
        img: ({ src }: any) => {
          return <ExpandableImage src={src} />
        },
        a: ({ href, children }: any) => {
          if (agentType === 'ios-native' || agentType === 'android-native') {
            return (
              <a
                href={href}
                onClick={(event) => {
                  event.preventDefault()
                  openLinkWithWarning(() => {
                    sendPostMessage({
                      type: 'open-link',
                      url: href,
                    })
                  })
                }}
                rel='noopener noreferrer'
              >
                {children}
              </a>
            )
          }

          if (
            (href || '')
              .toLocaleLowerCase()
              .startsWith((boostHubBaseUrl || '').toLocaleLowerCase())
          ) {
            return (
              <a
                onClick={(event) => {
                  event.preventDefault()
                  openLinkWithWarning(() => {
                    if (usingElectron) {
                      sendToElectron('new-window', href)
                    } else {
                      window.open(href, '_blank', 'noopener noreferrer')
                    }
                  })
                }}
                href={href}
              >
                {children}
              </a>
            )
          }
          if (usingElectron) {
            return (
              <a
                href={href}
                onClick={(event) => {
                  event.preventDefault()
                  openLinkWithWarning(() => {
                    openInBrowser(href)
                  })
                }}
              >
                {children}
              </a>
            )
          }

          return (
            <a
              onClick={(event) => {
                event.preventDefault()
                openLinkWithWarning(() => {
                  window.open(href, '_blank', 'noopener noreferrer')
                })
              }}
              href={href}
              target='_blank'
              rel='noopener noreferrer'
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
        flowchart: ({ children }: any) => {
          if (showLinkOpenWarning) {
            return <FlowchartWarningBlock />
          }
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
                if (identifier === 'toc') {
                  return <TableOfContents content={content} />
                }
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

    if (codeFence) {
      rehypeReactConfig.components.pre = CodeFence
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
      .use(remarkDocEmbed, {
        getEmbed,
      })
      .use(remarkAdmonitions, remarkAdmonitionOptions)
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
        theme: codeBlockTheme,
      })
      .use(rehypeMermaid)
      .use(rehypePosition)
      .use(rehypeReact, rehypeReactConfig)

    return parser
  }, [
    shortcodeHandler,
    codeFence,
    headerLinks,
    getEmbed,
    codeBlockTheme,
    openLinkWithWarning,
    sendToElectron,
    updateContent,
    content,
  ])

  const processorRef = useRef(markdownProcessor)

  const renderContentRef = useRef(
    throttle(
      async (content: string) => {
        try {
          checkboxIndexRef.current = 0
          const result = (await processorRef.current.process(content)) as any
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
      },
      100,
      { trailing: true }
    )
  )

  useEffect(() => {
    processorRef.current = markdownProcessor
    modeLoadCallbackRef.current = () => renderContentRef.current(content)
    renderContentRef.current(content)
  }, [content, markdownProcessor])

  useEffectOnce(() => {
    const callback = () => modeLoadCallbackRef.current?.call(null)
    window.addEventListener('codemirror-mode-load', callback)
    return () => {
      window.removeEventListener('codemirror-mode-load', callback)
    }
  })

  const displayContent = useMemo(() => {
    switch (state.type) {
      case 'loading':
        return <LoaderDocEditor />
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

  const StyledMarkdownPreview = useMemo(() => {
    return styled.div`
      position: relative;
      ${defaultPreviewStyle};
      ${previewStyle};

      padding: 0 ${({ theme }) => theme.sizes.spaces.md}px
        ${({ theme }) => theme.sizes.spaces.xl}px;

      .block__gutter {
        position: absolute;
        left: 100%;
        top: 0;
        max-width: 40px;
      }

      .with__gutter {
        position: relative;
      }

      .comment__count {
        height: 20px;
        display: flex;
        align-items: flex-start;
        color: ${({ theme }) => theme.colors.icon.default};
        font-size: ${({ theme }) => theme.sizes.fonts.md}px;

        &:hover {
          cursor: pointer;
          color: ${({ theme }) => theme.colors.text.primary};
        }

        svg {
          margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
        }
      }

      .comment__count__number {
        line-height: 1;
      }
    `
  }, [previewStyle])

  return (
    <StyledMarkdownPreview
      className={className}
      ref={scrollerRef || defaultRef}
    >
      {displayContent}
      {selectionState != null && SelectionMenu && (
        <SelectionTooltip rect={selectionState.position} bufferTop={50}>
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
  const nonTextNode = node.TEXT_NODE
    ? node.parentElement != null && node.parentElement.nodeName === 'A'
      ? node.parentElement.parentElement
      : node.parentElement
    : node
  if (nonTextNode == null || !isElement(nonTextNode)) return null
  const offset = parseInt(nonTextNode.getAttribute('data-offset') || '', 10)
  return isNaN(offset) ? null : offset
}

function isElement(node: Node): node is Element {
  return node.nodeType === 1
}

const StyledTooltipContent = styled.div`
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border.second};
  border-radius: ${({ theme }) => theme.borders.radius}px;
  max-height: 50px;
`

export default MarkdownView
