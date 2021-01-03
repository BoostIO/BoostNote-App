import React from 'react'
import { usePreferences } from '../lib/preferences'

interface ThemeLinkProps {
  theme: string
}

const ThemeLink = ({ theme }: ThemeLinkProps) => {
  if (theme == null || theme === 'default') {
    return null
  }
  if (theme === 'solarized-dark') {
    theme = 'solarized'
  }
  return <link href={`app/codemirror/theme/${theme}.css`} rel='stylesheet' />
}

const CodeMirrorStyle = () => {
  const { preferences } = usePreferences()
  const editorTheme = preferences['editor.theme']
  const markdownCodeBlockTheme = preferences['markdown.codeBlockTheme']

  if (editorTheme === markdownCodeBlockTheme) {
    return <ThemeLink theme={editorTheme} />
  }
  return (
    <>
      <ThemeLink theme={editorTheme} />
      <ThemeLink theme={markdownCodeBlockTheme} />
    </>
  )
}

export default CodeMirrorStyle
