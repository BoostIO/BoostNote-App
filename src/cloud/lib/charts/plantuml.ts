import visit from 'unist-util-visit'
import { Node } from 'unist'
import { deflateRaw } from 'pako'

const PLANT_SUPPORTED = ['plantuml', 'ditaa']

interface MdastPlant extends Node {
  lang: string
  value: string
}

interface RemarkPlantUMLConfig {
  server: string
}

export function remarkPlantUML({ server }: RemarkPlantUMLConfig) {
  return (tree: Node) => {
    visit(tree, isPlantNode, (node) => {
      const type = node.lang === 'ditaa' ? 'png' : 'svg'
      const compressed = deflateRaw(unescape(encodeURIComponent(node.value)), {
        to: 'string',
      })

      node.type = 'image'
      node.url = `${server}/${type}/${encode64(compressed)}`
    })
  }
}

function isPlantNode(node: any): node is MdastPlant {
  return (
    typeof node.value === 'string' &&
    typeof node.lang === 'string' &&
    PLANT_SUPPORTED.includes(node.lang)
  )
}

function encode64(data: string) {
  let r = ''
  for (let i = 0; i < data.length; i += 3) {
    if (i + 2 == data.length) {
      r += append3bytes(data.charCodeAt(i), data.charCodeAt(i + 1), 0)
    } else if (i + 1 == data.length) {
      r += append3bytes(data.charCodeAt(i), 0, 0)
    } else {
      r += append3bytes(
        data.charCodeAt(i),
        data.charCodeAt(i + 1),
        data.charCodeAt(i + 2)
      )
    }
  }
  return r
}

function append3bytes(b1: number, b2: number, b3: number) {
  const c1 = b1 >> 2
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4)
  const c3 = ((b2 & 0xf) << 2) | (b3 >> 6)
  const c4 = b3 & 0x3f
  let r = ''
  r += encode6bit(c1 & 0x3f)
  r += encode6bit(c2 & 0x3f)
  r += encode6bit(c3 & 0x3f)
  r += encode6bit(c4 & 0x3f)
  return r
}

function encode6bit(b: number) {
  if (b < 10) {
    return String.fromCharCode(48 + b)
  }
  b -= 10
  if (b < 26) {
    return String.fromCharCode(65 + b)
  }
  b -= 26
  if (b < 26) {
    return String.fromCharCode(97 + b)
  }
  b -= 26
  if (b == 0) {
    return '-'
  }
  if (b == 1) {
    return '_'
  }
  return '?'
}
