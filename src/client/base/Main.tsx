import { State } from 'client/redux/state'
import * as Actions from 'client/redux/actions'
import g, { ThemeProvider } from 'glamorous'
import React from 'react'
import { connect } from 'react-redux'
import {
  bindActionCreators,
  Dispatch,
} from 'redux'
import { Themes } from 'style'
import Nav from './Nav/Nav'
import PageRouter from './PageRouter'
import TitleBar from './TitleBar'

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
  location: {
    pathname: string
    search: string
    hash: string
  }
  isNavOpen: boolean
}

const stateToProps = (state: State): StateProps => ({
  location: state.Location,
  isNavOpen: state.UI.isNavOpen,
})

const dispatchProps = {
  toggleNav: Actions.UI.ActionCreators.toggleNav
}

type MainProps = StateProps & typeof dispatchProps

const Main = connect(stateToProps, dispatchProps)((props: MainProps) => {
  return (
    <ThemeProvider theme={Themes.defaultTheme}>
      <Styled.Main>
        <TitleBar
          toggleNav={props.toggleNav}
        />
        <Styled.Body>
          <Nav
            isNavOpen={props.isNavOpen}
          />
          <PageRouter
            location={props.location}
          />
        </Styled.Body>
      </Styled.Main>
    </ThemeProvider>
  )
})

export default Main
