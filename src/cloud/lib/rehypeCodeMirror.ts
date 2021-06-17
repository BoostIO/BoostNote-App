import CodeMirror from './editor/CodeMirror'
import visit from 'unist-util-visit'
import h from 'hastscript'
import { Node, Parent } from 'unist'

interface Element extends Parent {
  type: 'element'
  properties: { [key: string]: any }
}

export interface RehypeCodeMirrorOptions {
  ignoreMissing: boolean
  plainText: string[]
  theme: string
}

function isElement(node: Node, tagName: string): node is Element {
  if (node == null) {
    return false
  }
  return node.tagName === tagName
}

function rehypeCodeMirror(options: Partial<RehypeCodeMirrorOptions>) {
  const settings = options || {}
  const ignoreMissing = settings.ignoreMissing || false
  const theme = settings.theme || 'default'
  const plainText = settings.plainText || []
  return function (tree: Node) {
    visit<Element>(tree, 'element', visitor)

    return tree

    function visitor(
      node: Element,
      _index: number,
      parent: Parent | undefined
    ) {
      if (
        parent == null ||
        !isElement(parent, 'pre') ||
        !isElement(node, 'code')
      ) {
        return
      }

      const lang = language(node)

      const classNames =
        parent.properties.className != null
          ? [...parent.properties.className]
          : []
      if (theme === 'solarized-dark') {
        classNames.push(`cm-s-solarized`, `cm-s-dark`, 'CodeMirror')
      } else {
        classNames.push(`cm-s-${theme}`, 'CodeMirror')
      }
      if (lang != null) {
        classNames.push('language-' + lang)
      }
      parent.properties.className = classNames

      const rawContent = node.children[0].value as string
      // TODO: Stop using html attribute after exposing HAST Node is shipped
      parent.properties['data-raw'] = rawContent

      if (lang == null || lang === false || plainText.indexOf(lang) !== -1) {
        return
      }

      const cmResult = [] as Node[]
      if (lang != null) {
        const modeInfo = CodeMirror.findModeByName(lang)
        if (modeInfo == null) {
          if (ignoreMissing) {
            return
          }

          throw new Error(`Unknown language: \`${lang}\` is not registered`)
        }
        const mime = modeInfo.mime || modeInfo.mimes?.[0]
        parent.properties['data-ext'] = modeInfo.ext?.[0]
        parent.properties['data-mime'] = mime

        CodeMirror.runMode(rawContent, mime, (text, style) => {
          cmResult.push(
            h(
              'span',
              {
                className: style
                  ? 'cm-' + style.replace(/ +/g, ' cm-')
                  : undefined,
              },
              text
            )
          )
        })
      }

      node.children = cmResult
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
}

export default rehypeCodeMirror
