import { mergeDeepRight } from 'ramda'
import gh from 'hast-util-sanitize/lib/github.json'

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
