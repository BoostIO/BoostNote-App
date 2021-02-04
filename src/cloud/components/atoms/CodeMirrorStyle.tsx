import React from 'react'
import { useSettings, CodeMirrorEditorTheme } from '../../lib/stores/settings'

interface ThemeLinkProps {
  appTheme: string
  codeMirrorTheme: CodeMirrorEditorTheme
}

const ThemeLink = ({ codeMirrorTheme, appTheme }: ThemeLinkProps) => {
  if (codeMirrorTheme === 'default') {
    return appTheme === 'light' ? null : (
      <link
        href={`app/codemirror/theme/material-darker.css`}
        rel='stylesheet'
      />
    )
  }

  if (codeMirrorTheme === 'solarized-dark') {
    codeMirrorTheme = 'solarized'
  }
  return (
    <link
      href={`app/codemirror/theme/${codeMirrorTheme}.css`}
      rel='stylesheet'
    />
  )
}

const CodeMirrorStyle = () => {
  const { settings } = useSettings()
  const editorTheme = settings['general.editorTheme']
  const theme = settings['general.theme']
  const markdownCodeBlockTheme = settings['general.codeBlockTheme']

  if (editorTheme === markdownCodeBlockTheme) {
    return <ThemeLink codeMirrorTheme={editorTheme} appTheme={theme} />
  }

  return (
    <>
      <ThemeLink codeMirrorTheme={editorTheme} appTheme={theme} />
      <ThemeLink codeMirrorTheme={markdownCodeBlockTheme} appTheme={theme} />
    </>
  )
}

export default CodeMirrorStyle
