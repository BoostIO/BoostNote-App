declare module 'prettier/standalone' {
  import prettier from 'prettier'

  export default prettier
}

declare module 'prettier/parser-markdown' {
  import { Plugin } from 'prettier'

  const parserMarkdown: Plugin
  export default parserMarkdown
}
