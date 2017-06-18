import g from 'glamorous'
import React from 'react'
import { Themes } from 'style'

const TEMP_NAV_WIDTH = 150

const Styled = {
  Root: g.nav({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'width 0.3s',
  }, (props: NavProps, theme: Themes.Theme) => ({
    width: props.isNavOpen
      ? TEMP_NAV_WIDTH
      : 0,
    borderRight: theme.ui.border,
  })),
  Body: g.div({
    width: TEMP_NAV_WIDTH,
    flex: 1,
  }),
  Bottom: g.div({
    width: TEMP_NAV_WIDTH,
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

interface NavProps {
  isNavOpen: boolean
}

export const Nav = (props: NavProps) => (
  <Styled.Root isNavOpen={props.isNavOpen} >
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
