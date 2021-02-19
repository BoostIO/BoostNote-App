import unified, { Plugin } from 'unified'
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
  contentMap?: Map<string, EmbedDoc>
  content?: boolean
}

const remarkDocEmbed: Plugin = function ({
  contentMap,
  content = true,
}: Options = {}) {
  const parser = unified()
    .use(remarkParse)
    .use(remarkShortcodes)
    .use(removePosition)
    .use(remarkDocEmbed, { contentMap, content: false })

  return (tree) => {
    if (contentMap == null) {
      return
    }

    visit(tree, isDocEmbedNode, (node) => {
      const doc = contentMap.get(node.attributes.id)
      const cast = node as any

      cast.type = 'parent'
      cast.data = {
        hName: 'div',
        hProperties: {
          className: ['doc-embed', 'collapsed'],
        },
      }

      if (doc == null) {
        cast.children = [
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

      const bodyNodes: Node[] = []
      const titleSection = makeTitleSectionNode(doc.title, doc.link)

      bodyNodes.push(
        makeWrapperNode([titleSection], {
          className: ['doc-embed-header'],
        })
      )

      if (content) {
        const parsed = parser.runSync(parser.parse(doc.content))
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
    })
  }
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
