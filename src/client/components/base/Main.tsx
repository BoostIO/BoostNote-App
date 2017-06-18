import { State, UI } from 'client/redux'
import g, { ThemeProvider } from 'glamorous'
import React from 'react'
import { connect } from 'react-redux'
import {
  bindActionCreators,
  Dispatch,
} from 'redux'
import { Themes } from 'style'
import { Nav } from './Nav'
import { PageView } from './PageView'
import { TitleBar } from './TitleBar'

const Styled = {
  Main: g.div({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
  }),
  Body: g.div({
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
  }),
}

interface StateProps {
  ui: UI.State
}

const stateToProps = (state: State): StateProps => ({
  ui: state.ui,
})

interface DispatchProps {
  actions: UI.ActionCreators
}

const dispatchToProps = (dispatch: Dispatch<any>): DispatchProps => ({
  actions: bindActionCreators(UI.ActionCreators, dispatch),
})

type MainProps = StateProps & DispatchProps & {}

export const Main = connect(stateToProps, dispatchToProps)((props: MainProps) => {
  return (
    <ThemeProvider theme={Themes.defaultTheme}>
      <Styled.Main>
        <TitleBar
          toggleNav={props.actions.toggleNav}
        />
        <Styled.Body>
          <Nav
            isNavOpen={props.ui.isNavOpen}
          />
          <PageView />
        </Styled.Body>
      </Styled.Main>
    </ThemeProvider>
  )
})
