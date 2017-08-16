import g from 'glamorous'
import React from 'react'
import { Themes } from 'style'

const Styled = {
  Root: g.div({
    height: 36,
  }, (props: any, theme: Themes.Theme) => {
    return {
      borderBottom: theme.ui.border,
    }
  }),
}

interface TitleBarProps {
  toggleNav: () => void
}

const TitleBar = (props: TitleBarProps) => {
  return <Styled.Root>
    <button onClick={props.toggleNav}>ToggleNav</button>
    <button>Delete</button>
    <button>New Post</button>
  </Styled.Root>
}

export default TitleBar
