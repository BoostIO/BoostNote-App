jest.mock('codemirror', () => ({
  Pos: (line: number, ch: number) => ({ line, ch }),
}))
jest.mock('codemirror/addon/runmode/runmode', () => undefined)
jest.mock('codemirror/mode/markdown/markdown', () => undefined)
jest.mock('codemirror/mode/javascript/javascript', () => undefined)
jest.mock('codemirror/mode/css/css', () => undefined)
jest.mock('codemirror/mode/diff/diff', () => undefined)
jest.mock('codemirror/lib/codemirror.css', () => undefined)
jest.mock('codemirror/addon/edit/continuelist', () => undefined)
jest.mock('codemirror/keymap/vim', () => undefined)
jest.mock('codemirror/addon/hint/show-hint', () => undefined)
jest.mock('codemirror/addon/hint/show-hint.css', () => undefined)
jest.mock('codemirror/keymap/sublime', () => undefined)
jest.mock('codemirror/keymap/emacs', () => undefined)
jest.mock('codemirror/addon/scroll/scrollpastend', () => undefined)
jest.mock('../../../design/lib/codemirror/util', () => ({
  loadMode: jest.fn(),
}))

import {
  getCodeBlockHintContext,
  getCodeBlockModeSuggestions,
} from './CodeMirror'

describe('CodeMirror code block mode hints', () => {
  test('detects backtick and tilde code fences', () => {
    expect(getCodeBlockHintContext('```', 3)).toEqual({
      fenceMarker: '```',
      language: '',
    })
    expect(getCodeBlockHintContext('~~~js', 5)).toEqual({
      fenceMarker: '~~~',
      language: 'js',
    })
  })

  test('offers a plain code block option before initial language hints', () => {
    const suggestions = getCodeBlockModeSuggestions('', '```')

    expect(suggestions[0].text).toEqual('')
    expect(suggestions[0].displayText).toEqual('Plain code block')
    expect(suggestions.map((suggestion) => suggestion.text)).toContain('js')
    expect(suggestions.map((suggestion) => suggestion.text)).toContain('python')
  })

  test('selected language hint completes the code block', () => {
    const jsSuggestion = getCodeBlockModeSuggestions('j', '```').find(
      (suggestion) => suggestion.text === 'js'
    )
    const cm = {
      replaceRange: jest.fn(),
      setCursor: jest.fn(),
    }

    expect(jsSuggestion).toBeDefined()
    jsSuggestion!.hint!(
      cm as any,
      {
        from: { line: 4, ch: 0 },
        to: { line: 4, ch: 4 },
        list: [],
      },
      jsSuggestion!
    )

    expect(cm.replaceRange).toHaveBeenCalledWith(
      '```js\n\n```',
      { line: 4, ch: 0 },
      { line: 4, ch: 4 },
      'complete'
    )
    expect(cm.setCursor).toHaveBeenCalledWith({ line: 5, ch: 0 })
  })
})
