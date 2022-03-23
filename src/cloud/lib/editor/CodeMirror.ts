import CodeMirror from 'codemirror'
import 'codemirror/addon/runmode/runmode'
import 'codemirror/mode/markdown/markdown'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/mode/css/css'
import 'codemirror/mode/diff/diff'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/keymap/vim'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/keymap/sublime'
import 'codemirror/keymap/emacs'
import 'codemirror/addon/scroll/scrollpastend'
import { loadMode } from '../../../design/lib/codemirror/util'

loadMode(CodeMirror)

export default CodeMirror

export interface EditorPosition {
  line: number
  ch: number
}

type SuggestionModeType = {
  [key: string]: {
    autocomplete: string
    compareText?: string
    displayText: string
  }[]
}

const supportedModeSuggestions: SuggestionModeType = {
  a: [
    { autocomplete: 'apl', displayText: 'APL' },
    { autocomplete: 'asn', displayText: 'ASN.1' },
    { autocomplete: 'asterisk', displayText: 'Asterisk dialplan' },
  ],
  b: [{ autocomplete: 'brainfuck', displayText: 'Brainfuck' }],
  c: [
    { autocomplete: 'c', displayText: 'C' },
    { autocomplete: 'cpp', displayText: 'C++' },
    { autocomplete: 'c#', displayText: 'C#' },
    {
      autocomplete: 'ceylon',
      displayText: 'Ceylon',
    },
    { autocomplete: 'clojure', displayText: 'Clojure' },
    {
      compareText: 'gss',
      autocomplete: 'css',
      displayText: 'Closure Stylesheets (GSS)',
    },
    { autocomplete: 'cmake', displayText: 'CMake' },
    { autocomplete: 'cobol', displayText: 'Cobol' },
    { autocomplete: 'coffeescript', displayText: 'CoffeeScript' },
    { autocomplete: 'commonlisp', displayText: 'Common Lisp' },
    { autocomplete: 'crystal', displayText: 'Crystal' },
    { autocomplete: 'css', displayText: 'CSS' },
    { autocomplete: 'cypher', displayText: 'Cypher' },
    { autocomplete: 'cython', displayText: 'Cython' },
  ],
  d: [
    { autocomplete: 'd', displayText: 'D' },
    { autocomplete: 'dart', displayText: 'Dart' },
    { autocomplete: 'django', displayText: 'Django (templating language)' },
    { autocomplete: 'dockerfile', displayText: 'Dockerfile' },
    { autocomplete: 'diff', displayText: 'Diff' },
    { autocomplete: 'dtd', displayText: 'DTD' },
    { autocomplete: 'dylan', displayText: 'Dylan' },
  ],
  e: [
    { autocomplete: 'ebnf', displayText: 'EBNF' },
    { autocomplete: 'ecl', displayText: 'ECL' },
    { autocomplete: 'eiffel', displayText: 'Eiffel' },
    { autocomplete: 'elm', displayText: 'Elm' },
    { autocomplete: 'erlang', displayText: 'Erlang' },
  ],
  f: [
    { autocomplete: 'factor', displayText: 'Factor' },
    { autocomplete: 'fcl', displayText: 'FCL' },
    { autocomplete: 'forth', displayText: 'Forth' },
    { autocomplete: 'fortran', displayText: 'Fortan' },
    { autocomplete: 'f#', displayText: 'F#' },
  ],
  g: [
    { autocomplete: 'gas', displayText: 'Gas (AT&T-style assembly)' },
    { autocomplete: 'gherkin', displayText: 'Gherkin' },
    { autocomplete: 'go', displayText: 'Go' },
    { autocomplete: 'groovy', displayText: 'Groovy' },
  ],
  h: [
    { autocomplete: 'haml', displayText: 'HAML' },
    { autocomplete: 'handlebars', displayText: 'Handlebars' },
    { autocomplete: 'haskell', displayText: 'Haskell' },
    { autocomplete: 'haskell-literate', displayText: 'Haskell (literate)' },
    { autocomplete: 'haxe', displayText: 'Haxe' },
    {
      autocomplete: 'htmlembedded',
      displayText: 'HTML embedded (JSP, ASP.NET)',
    },
    { autocomplete: 'htmlmixed', displayText: 'HTML mixed-mode' },
    { autocomplete: 'html', displayText: 'HTML' },
    { autocomplete: 'http', displayText: 'HTTP' },
  ],
  i: [{ autocomplete: 'idl', displayText: 'IDL' }],
  j: [
    { autocomplete: 'js', displayText: 'Javascript' },
    { autocomplete: 'jinja2', displayText: 'Jinja2' },
    { autocomplete: 'jsx', displayText: 'Javascript (JSX)' },
    { autocomplete: 'julia', displayText: 'Julia' },
  ],
  l: [
    { autocomplete: 'livescript', displayText: 'Livescript' },
    { autocomplete: 'lua', displayText: 'Lua' },
    { autocomplete: 'less', displayText: 'LESS' },
  ],
  k: [{ autocomplete: 'kotlin', displayText: 'Kotlin' }],
  m: [
    { autocomplete: 'markdown', displayText: 'Markdown (GitHub-flavour)' },
    { autocomplete: 'mathematica', displayText: 'Mathematica' },
    { autocomplete: 'mbox', displayText: 'mbox' },
    { autocomplete: 'mirc', displayText: 'mIRC' },
    { autocomplete: 'modelica', displayText: 'modelica' },
    { autocomplete: 'mscgen', displayText: 'MscGen' },
    { autocomplete: 'mumps', displayText: 'MUMPS' },
  ],
  n: [
    { autocomplete: 'nginx', displayText: 'Nginx' },
    { autocomplete: 'nsis', displayText: 'NSIS' },
    { autocomplete: 'ntriples', displayText: 'N-Triples/N-Quads' },
  ],
  o: [
    { autocomplete: 'octave', displayText: 'Octave (MATLAB)' },
    { autocomplete: 'oz', displayText: 'Oz' },
    { autocomplete: 'ocaml', displayText: 'OCaml' },
    {
      autocomplete: 'objc',
      displayText: 'ObjectiveC',
    },
  ],
  p: [
    { autocomplete: 'pascal', displayText: 'Pascal' },
    { autocomplete: 'pegjs', displayText: 'PEG.js' },
    { autocomplete: 'perl', displayText: 'Perl' },
    { autocomplete: 'pgp', displayText: 'PGP (ASCII armor)' },
    { autocomplete: 'php', displayText: 'PHP' },
    { autocomplete: 'pig', displayText: 'Pig Latin' },
    { autocomplete: 'powershell', displayText: 'PowerShell' },
    { autocomplete: 'properties', displayText: 'Properties files' },
    { autocomplete: 'protobuf', displayText: 'ProtoBuf' },
    { autocomplete: 'pug', displayText: 'Pug' },
    { autocomplete: 'puppet', displayText: 'Puppet' },
    { autocomplete: 'python', displayText: 'Python' },
    { autocomplete: 'plantuml', displayText: 'PlantUML' },
  ],
  q: [{ autocomplete: 'q', displayText: 'Q' }],
  r: [
    { autocomplete: 'r', displayText: 'R' },
    { autocomplete: 'rpm', displayText: 'rpm' },
    { autocomplete: 'rst', displayText: 'reStructuredText' },
    { autocomplete: 'ruby', displayText: 'Ruby' },
    { autocomplete: 'rust', displayText: 'Rust' },
  ],
  s: [
    { autocomplete: 'sas', displayText: 'SAS' },
    { autocomplete: 'sass', displayText: 'Sass' },
    { autocomplete: 'scheme', displayText: 'Scheme' },
    { autocomplete: 'scala', displayText: 'Scala' },
    { autocomplete: 'shell', displayText: 'Shell' },
    { autocomplete: 'sieve', displayText: 'Sieve' },
    { autocomplete: 'slim', displayText: 'Slim' },
    { autocomplete: 'smalltalk', displayText: 'Smalltalk' },
    { autocomplete: 'spreadsheet', displayText: 'Spreadsheet' },
    { autocomplete: 'smarty', displayText: 'Smarty' },
    { autocomplete: 'solr', displayText: 'Solr' },
    { autocomplete: 'soy', displayText: 'Soy' },
    { autocomplete: 'sparql', displayText: 'SPARQL' },
    { autocomplete: 'sql', displayText: 'SQL' },
    { autocomplete: 'stex', displayText: 'sTeX, LaTeX' },
    { autocomplete: 'stylus', displayText: 'Stylus' },
    { autocomplete: 'swift', displayText: 'Swift' },
  ],
  t: [
    { autocomplete: 'tcl', displayText: 'Tcl' },
    { autocomplete: 'textile', displayText: 'Textile' },
    { autocomplete: 'tiddlywiki', displayText: 'Tiddlywiki' },
    { autocomplete: 'tiki', displayText: 'Tiki wiki' },
    { autocomplete: 'toml', displayText: 'TOML' },
    { autocomplete: 'tornado', displayText: 'Tornado (templating language)' },
    { autocomplete: 'troff', displayText: 'troff (for manpages)' },
    { autocomplete: 'ttcn', displayText: 'TTCN' },
    { autocomplete: 'ttcn-cfg', displayText: 'TTCN Configuration' },
    { autocomplete: 'turtle', displayText: 'Turtle' },
    { autocomplete: 'twig', displayText: 'Twig' },
  ],
  v: [
    { autocomplete: 'vb', displayText: 'VB.NET' },
    { autocomplete: 'vbscript', displayText: 'VBScript' },
    { autocomplete: 'velocity', displayText: 'Velocity' },
    { autocomplete: 'verilog', displayText: 'Verilog/SystemVerilog' },
    { autocomplete: 'vhdl', displayText: 'VHDL' },
    { autocomplete: 'vue', displayText: 'Vue.js app' },
  ],
  w: [
    { autocomplete: 'webidl', displayText: 'Web IDL' },
    { autocomplete: 'wast', displayText: 'WebAssembly Text Format' },
  ],
  x: [
    { autocomplete: 'xml', displayText: 'XML/HTML' },
    { autocomplete: 'xquery', displayText: 'XQuery' },
  ],
  y: [
    { autocomplete: 'yacas', displayText: 'Yacas' },
    { autocomplete: 'yaml', displayText: 'YAML' },
    { autocomplete: 'yaml-frontmatter', displayText: 'YAML frontmatter' },
  ],
  z: [{ autocomplete: 'z80', displayText: 'Z80' }],
}

const improvedModeSuggestions = {}
for (const [key, suggestions] of Object.entries(supportedModeSuggestions)) {
  improvedModeSuggestions[key] = suggestions.map((suggestion) => {
    return {
      compareText: suggestion.compareText,
      autocomplete: suggestion.autocomplete,
      displayText: `${suggestion.displayText} [${suggestion.autocomplete}]`,
    }
  })
}

export function getModeSuggestions(
  word: string,
  suggestionModes: SuggestionModeType = improvedModeSuggestions
): CodeMirror.Hint[] {
  for (const [key, suggestions] of Object.entries(suggestionModes)) {
    if (!word.startsWith(key)) {
      continue
    }
    const filteredSuggestions = suggestions.filter(
      (suggestion) =>
        suggestion.autocomplete.startsWith(word) ||
        (suggestion.compareText != null &&
          suggestion.compareText.startsWith(word))
    )
    /*
      if user accepted suggestion - don't show suggestion which auto-completes to the same string
      this handles not only case when we are not calling `showHint` programmatically but also
      when it shows automatically (from inside the show hint plugin), and handles this case gracefully
    */
    if (
      filteredSuggestions.length == 1 &&
      (word == filteredSuggestions[0].autocomplete ||
        word == filteredSuggestions[0].compareText)
    ) {
      continue
    }

    return filteredSuggestions
      .sort((a, b) => {
        const textA = a.compareText != null ? a.compareText : a.autocomplete
        const textB = b.compareText != null ? b.compareText : b.autocomplete
        return textA.length - textB.length
      })
      .map((suggestion) => {
        return {
          text: suggestion.autocomplete,
          displayText: suggestion.displayText,
        }
      })
  }
  return []
}

export function CodeMirrorEditorModeHints(cm: CodeMirror.Editor) {
  return new Promise(function (accept) {
    setTimeout(function () {
      const cursor = cm.getCursor(),
        line = cm.getLine(cursor.line)
      let start = cursor.ch
      let end = cursor.ch
      while (start && /\w/.test(line.charAt(start - 1))) --start
      while (end < line.length && /\w/.test(line.charAt(end))) ++end
      const word = line.slice(start, end).toLowerCase()
      const suggestions = getModeSuggestions(word)
      if (suggestions.length == 0) {
        return accept(null)
      }
      return accept({
        list: suggestions,
        from: CodeMirror.Pos(cursor.line, start),
        to: CodeMirror.Pos(cursor.line, end),
      })
    }, 100)
  })
}
