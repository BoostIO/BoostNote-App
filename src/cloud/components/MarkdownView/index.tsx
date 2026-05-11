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
import { schema } from './schema'
import MarkdownRenderWorker from 'worker-loader!./markdownRender.worker'

const remarkAdmonitionOptions = {
  tag: ':::',
  icons: 'emoji',
  infima: false,
}

export { schema }

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

interface MarkdownWorkerResponse {
  type: 'rendered' | 'error'
  id: number
  tree?: any
  error?: string
}

interface RenderConfig {
  mainThreadProcessor: any
  reactProcessor: any
  getEmbed?: MarkdownViewProps['getEmbed']
}

const docEmbedPattern =
  /\[\[\s*(?:boostnote|boosthub)\.doc\b[^\]]*\bid=(?:"([^"]+)"|'([^']+)'|([^\s\]]+))/g

async function resolveEmbedDocs(
  content: string,
  getEmbed: MarkdownViewProps['getEmbed']
) {
  if (getEmbed == null || !content.includes('.doc')) {
    return {}
  }

  const ids = new Set<string>()
  let match = docEmbedPattern.exec(content)
  while (match != null) {
    const id = match[1] || match[2] || match[3]
    if (id != null) {
      ids.add(id)
    }
    match = docEmbedPattern.exec(content)
  }
  docEmbedPattern.lastIndex = 0

  const embeds: { [id: string]: EmbedDoc | undefined } = {}
  await Promise.all(
    Array.from(ids).map(async (id) => {
      embeds[id] = await getEmbed(id)
    })
  )
  return embeds
}

function createMarkdownWorker() {
  if (typeof Worker === 'undefined') {
    return null
  }

  try {
    return new MarkdownRenderWorker()
  } catch {
    return null
  }
}

function renderMarkdownInWorker(
  worker: Worker,
  id: number,
  content: string,
  embeds: { [id: string]: EmbedDoc | undefined }
) {
  return new Promise<any>((resolve, reject) => {
    const onMessage = ({ data }: MessageEvent) => {
      const response = data as MarkdownWorkerResponse
      if (response.id !== id) {
        return
      }

      cleanup()
      if (response.type === 'error') {
        reject(new Error(response.error || 'Markdown worker failed'))
      } else {
        resolve(response.tree)
      }
    }
    const onError = (event: ErrorEvent) => {
      cleanup()
      reject(event.error || new Error(event.message))
    }
    function cleanup() {
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)
    }

    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', onError)
    worker.postMessage({ type: 'render', id, content, embeds })
  })
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

  const renderConfig = useMemo<RenderConfig>(() => {
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

    const mainThreadProcessor = unified()
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

    const reactProcessor = unified()
      .use(rehypeCodeMirror, {
        ignoreMissing: true,
        theme: codeBlockTheme,
      })
      .use(rehypeMermaid)
      .use(rehypePosition)
      .use(rehypeReact, rehypeReactConfig)

    return { mainThreadProcessor, reactProcessor, getEmbed }
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
    showLinkOpenWarning,
  ])

  const renderConfigRef = useRef(renderConfig)
  const renderWorkerRef = useRef<Worker | null>(null)
  const renderRequestIdRef = useRef(0)

  const renderContentRef = useRef(
    throttle(
      async (content: string) => {
        const requestId = ++renderRequestIdRef.current
        try {
          checkboxIndexRef.current = 0
          const { reactProcessor, getEmbed } = renderConfigRef.current
          if (renderWorkerRef.current == null) {
            renderWorkerRef.current = createMarkdownWorker()
          }
          if (renderWorkerRef.current == null) {
            throw new Error('Markdown worker is unavailable')
          }

          const embeds = await resolveEmbedDocs(content, getEmbed)
          const tree = await renderMarkdownInWorker(
            renderWorkerRef.current,
            requestId,
            content,
            embeds
          )
          if (requestId !== renderRequestIdRef.current) {
            return
          }

          const renderedTree = await reactProcessor.run(tree)
          const result = reactProcessor.stringify(renderedTree)
          setState({
            type: 'loaded',
            content: result as React.ReactNode,
          })
          runAfterRenderCallbacks(push, onRenderRef)
        } catch {
          try {
            const { mainThreadProcessor } = renderConfigRef.current
            const result = (await mainThreadProcessor.process(content)) as any
            if (requestId !== renderRequestIdRef.current) {
              return
            }
            setState({
              type: 'loaded',
              content: result.result,
            })
            runAfterRenderCallbacks(push, onRenderRef)
          } catch (fallbackErr) {
            setState({ type: 'error', err: fallbackErr as any })
          }
        }
      },
      100,
      { trailing: true }
    )
  )

  useEffect(() => {
    renderConfigRef.current = renderConfig
    modeLoadCallbackRef.current = () => renderContentRef.current(content)
    renderContentRef.current(content)
  }, [content, renderConfig])

  useEffectOnce(() => {
    return () => {
      renderWorkerRef.current?.terminate()
    }
  })

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

function runAfterRenderCallbacks(
  push: (path: string) => void,
  onRenderRef: React.MutableRefObject<(() => any) | undefined>
) {
  document.querySelectorAll('.collapse-trigger').forEach((trigger) => {
    trigger.addEventListener('click', triggerCollapse)
  })
  document.querySelectorAll('.doc-embed-header a').forEach((docEmbedLink) => {
    docEmbedLink.addEventListener('click', (event) => {
      if (
        ((event as MouseEvent).ctrlKey || (event as MouseEvent).metaKey) &&
        !usingElectron
      ) {
        return
      }

      event.preventDefault()
      push((event.currentTarget as HTMLAnchorElement).href)
    })
  })
  if (onRenderRef.current != null) {
    onRenderRef.current()
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
