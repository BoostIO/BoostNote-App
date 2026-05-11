import unified from 'unified'
import remarkParse from 'remark-parse'
import remarkShortcodes from 'remark-shortcodes'
import remarkMath from 'remark-math'
import remarkRehype from 'remark-rehype'
import rehypeKatex from 'rehype-katex'
import remarkAdmonitions from 'remark-admonitions'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeSlug from 'rehype-slug'
import visit from 'unist-util-visit'
import { Node } from 'unist'
import { shortcodeRehypeHandler } from '../../lib/shortcode'
import remarkDocEmbed, { EmbedDoc } from '../../lib/docEmbedPlugin'
import { remarkPlantUML } from '../../lib/charts/plantuml'
import { schema } from './schema'

const remarkAdmonitionOptions = {
  tag: ':::',
  icons: 'emoji',
  infima: false,
}

const chartLanguages = [
  'flowchart',
  'mermaid',
  'sequence',
  'chart',
  'chart(yaml)',
]

interface RenderMarkdownRequest {
  type: 'render'
  id: number
  content: string
  embeds: { [id: string]: EmbedDoc | undefined }
}

interface RenderMarkdownSuccess {
  type: 'rendered'
  id: number
  tree: Node
}

interface RenderMarkdownFailure {
  type: 'error'
  id: number
  error: string
}

type RenderMarkdownResponse = RenderMarkdownSuccess | RenderMarkdownFailure

const ctx: Worker = self as any

ctx.addEventListener('message', async ({ data }: MessageEvent) => {
  const request = data as RenderMarkdownRequest
  if (request.type !== 'render') {
    return
  }

  try {
    const processor = createMarkdownProcessor(request.embeds)
    const tree = processor.parse(request.content)
    const processedTree = await processor.run(tree)
    postResponse({ type: 'rendered', id: request.id, tree: processedTree })
  } catch (err) {
    postResponse({
      type: 'error',
      id: request.id,
      error: err instanceof Error ? err.message : `${err}`,
    })
  }
})

function createMarkdownProcessor(embeds: RenderMarkdownRequest['embeds']) {
  return unified()
    .use(remarkParse)
    .use(remarkShortcodes)
    .use(remarkDocEmbed, {
      getEmbed: (id: string) => embeds[id],
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
}

function remarkCharts() {
  return (tree: Node) => {
    visit(tree, 'code', (node: any) => {
      if (
        typeof node.lang !== 'string' ||
        !chartLanguages.includes(node.lang)
      ) {
        return
      }

      node.type = node.lang
      node.data = {
        hName: node.lang,
        hChildren: [{ type: 'text', value: node.value }],
        hProperties: {
          className: [node.lang],
        },
      }
    })
  }
}

function postResponse(response: RenderMarkdownResponse) {
  ctx.postMessage(response)
}
