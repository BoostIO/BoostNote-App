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
import Nav from './Nav'
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
  isLoading: boolean
}

const stateToProps = (state: State): StateProps => ({
  location: state.location,
  isNavOpen: state.ui.isNavOpen,
  isLoading: state.ui.isLoading,
})

const dispatchProps = {
  toggleNav: Actions.UI.ActionCreators.toggleNav,
  requestCreateNote: Actions.UI.ActionCreators.requestCreateNote,
}

type MainProps = StateProps & typeof dispatchProps

const Main = (props: MainProps) => {
  return (
    <ThemeProvider theme={Themes.defaultTheme}>
      {props.isLoading
        ? <div>Loading...</div>
        : <Styled.Main>
          <TitleBar
            toggleNav={props.toggleNav}
            requestCreateNote={props.requestCreateNote}
          />
          <Styled.Body>
            <Nav/>
            <PageRouter
              location={props.location}
            />
          </Styled.Body>
        </Styled.Main>
      }

    </ThemeProvider>
  )
}

export default connect(stateToProps, dispatchProps)(Main)
