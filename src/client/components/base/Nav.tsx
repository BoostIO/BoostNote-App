import g from 'glamorous'
import React from 'react'
import { Themes } from 'style'

const Styled = {
  Root: g.nav({
    width: 150,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  }, (props: any, theme: Themes.Theme) => ({
    borderRight: theme.ui.border,
  })),
  Body: g.div({
    flex: 1,
  }),
  Bottom: g.div({
    height: 36,
    display: 'flex',
  }),
  BottomPlusButton: g.button({
    flex: 1,
    border: 'none',
  }),
  BottomMoreButton: g.button({
    width: 36,
  }, (props: any, theme: Themes.Theme) => ({
    borderLeft: theme.ui.border,
  })),
}

export const Nav = () => (
  <Styled.Root>
    <Styled.Body>
      Nav
    </Styled.Body>
    <Styled.Bottom>
      <Styled.BottomPlusButton>
        + Add Repo/Folder
      </Styled.BottomPlusButton>
      <Styled.BottomMoreButton>
        ...
      </Styled.BottomMoreButton>
    </Styled.Bottom>
  </Styled.Root>
)
