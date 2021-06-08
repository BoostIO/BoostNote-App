import unified, { Plugin, Processor } from 'unified'
import remarkParse from 'remark-parse'
import remarkShortcodes from 'remark-shortcodes'
import visit from 'unist-util-visit'
import { Node } from 'unist'
import { mdiChevronDown, mdiLaunch } from '@mdi/js'

interface EmbedNode extends Node {
  type: 'shortcode'
  identifier: 'boostnote.doc'
  attributes: { id: string }
}

export interface EmbedDoc {
  title: string
  link: string
  content: string
}

interface Options {
  showContent?: boolean
  getEmbed?: (
    id: string
  ) => Promise<EmbedDoc | undefined> | EmbedDoc | undefined
}

type ContentResult = [EmbedNode, EmbedDoc | undefined]

const remarkDocEmbed: Plugin = function ({
  getEmbed,
  showContent = true,
}: Options = {}) {
  return async (tree) => {
    if (getEmbed == null) {
      return
    }

    const embeds: EmbedNode[] = []
    visit(tree, isDocEmbedNode, (node) => embeds.push(node))

    const withDocs = await Promise.all(
      embeds.map(
        async (node): Promise<ContentResult> => {
          try {
            const embedContent = await getEmbed(node.attributes.id)
            return [node, embedContent]
          } catch (err) {
            return [node, undefined]
          }
        }
      )
    )

    const parser = unified()
      .use(remarkParse)
      .use(remarkShortcodes)
      .use(removePosition)
      .use(remarkDocEmbed, { getEmbed, showContent: false })

    await Promise.all(
      withDocs.map(([node, content]) => {
        return content != null
          ? buildEmbedNode(node, content, parser, showContent)
          : buildMissingNode(node)
      })
    )
  }
}

function buildMissingNode(node: Node) {
  node.type = 'parent'
  node.data = {
    hName: 'div',
    hProperties: {
      className: ['doc-embed', 'collapsed'],
    },
  }
  node.children = [
    makeWrapperNode(
      [
        makeWrapperNode(
          [
            makeHeadingNode('Doc Not Found'),
            makeParagraphNode(
              'This could mean a document with the given ID does not exist or has been deleted'
            ),
          ],
          {
            className: 'doc-embed-error',
          }
        ),
      ],
      {
        className: 'doc-embed-header',
      }
    ),
  ]
  return
}

async function buildEmbedNode(
  node: EmbedNode,
  content: EmbedDoc,
  parser: Processor,
  showContent: boolean
) {
  const cast = node as any

  cast.type = 'parent'
  cast.data = {
    hName: 'div',
    hProperties: {
      className: ['doc-embed', 'collapsed'],
    },
  }

  const bodyNodes: Node[] = []
  const titleSection = makeTitleSectionNode(content.title, content.link)

  bodyNodes.push(
    makeWrapperNode([titleSection], {
      className: ['doc-embed-header'],
    })
  )

  if (showContent) {
    const parsed = await parser.run(parser.parse(content.content))
    bodyNodes.push(
      makeWrapperNode(parsed.children as Node[], {
        className: ['doc-embed-content'],
      })
    )
  }

  const bodyWrapper = makeWrapperNode(
    content
      ? [
          makeWrapperNode(
            [
              makeIconNode(mdiChevronDown),
              {
                type: 'parent',
                data: {
                  hName: 'i',
                  hProperties: { className: 'threadline' },
                },
              },
            ],
            {
              className: 'collapse-trigger',
            }
          ),
          makeWrapperNode(bodyNodes, { className: 'embed-body' }),
        ]
      : bodyNodes,
    {
      className: ['doc-embed-wrapper'],
    }
  )

  cast.children = [bodyWrapper]
}

const removePosition: Plugin = function () {
  return (tree) =>
    visit(tree, (node) => {
      delete node.position
    })
}

function makeWrapperNode(children: Node[], attrs = {}) {
  return {
    type: 'parent',
    children,
    data: {
      hName: 'div',
      hProperties: attrs,
    },
  }
}

function makeTitleSectionNode(title: string, link: string) {
  return makeWrapperNode([
    makeHeadingNode(title),
    {
      type: 'link',
      url: link,
      title,
      children: [makeIconNode(mdiLaunch), { type: 'text', value: link }],
    },
  ])
}

function makeHeadingNode(value: string, depth = 1) {
  return {
    type: 'heading',
    depth,
    children: [{ type: 'text', value }],
    data: {
      hProperties: { id: '' },
    },
  }
}

function makeParagraphNode(value: string) {
  return {
    type: 'paragraph',
    children: [
      {
        type: 'text',
        value,
      },
    ],
  }
}

function makeIconNode(path: string, attrs = {}) {
  return {
    type: 'image',
    url: '',
    alt: 'link-icon',
    data: {
      hName: 'svg',
      hProperties: {
        viewBox: '0 0 24 24',
        ...attrs,
      },
      hChildren: [
        {
          type: 'element',
          tagName: 'path',
          properties: {
            d: path,
          },
        },
      ],
    },
  }
}

function isDocEmbedNode(node: any): node is EmbedNode {
  return (
    node.type === 'shortcode' &&
    (node.identifier === 'boostnote.doc' ||
      node.identifier === 'boosthub.doc') &&
    node.attributes != null &&
    typeof node.attributes.id === 'string'
  )
}

export default remarkDocEmbed
