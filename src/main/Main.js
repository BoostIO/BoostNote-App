import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import styled, { ThemeProvider } from 'styled-components'
import TitleBar from './TitleBar'
import themes from 'lib/themes'
import Nav from './Nav/Nav'
import dataAPI from './lib/dataAPI'
import { NAV_MIN_WIDTH } from 'lib/consts'
import ipc from './lib/ipc'
import NoteList from './NoteList'

function hideLoadingScreen () {
  document.body.removeChild(document.getElementById('loading'))
}

const { remote } = require('electron')

const Root = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  user-select: none;
`

const Body = styled.div`
  position: absolute;
  top: 37px;
  left: 0;
  bottom: 0;
  right: 0;
  display: flex;
`

const Slider = styled.div`
  position: relative;
  width: 5px;
  cursor: col-resize;
  display: flex;
  margin-left: -2px;
  margin-right: -2px;
  z-index: 2;
`

const SliderLine = styled.div`
  margin-left: 2px;
  width: 1px;
  background-color: ${p => p.active ? p.theme.activeBorderColor : p.theme.borderColor};
`

const Content = styled.div`
  flex: 1;
  position: relative;
  z-index: 1;
`

class Main extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      navWidth: props.status.get('navWidth'),
      search: '',
      isSliderActive: false
    }

    this.handleSliderMouseDown = e => {
      window.addEventListener('mouseup', this.handleSliderMouseUp)
      window.addEventListener('mousemove', this.handleSliderMouseMove)
      this.setState({
        isSliderActive: true
      })
    }

    this.handleSliderMouseMove = e => {
      this.setState({
        navWidth: e.clientX > NAV_MIN_WIDTH ? e.clientX : NAV_MIN_WIDTH
      })
    }

    this.handleSliderMouseUp = e => {
      window.removeEventListener('mouseup', this.handleSliderMouseUp)
      window.removeEventListener('mousemove', this.handleSliderMouseMove)

      const width = e.clientX > NAV_MIN_WIDTH ? e.clientX : NAV_MIN_WIDTH
      this.setState({
        isSliderActive: false,
        navWidth: width
      }, () => {
        const { store } = this.context
        const { status } = this.props

        store.dispatch({
          type: 'UPDATE_STATUS',
          payload: {
            status: status.set('navWidth', width)
          }
        })
      })
    }
  }

  componentDidMount () {
    window.addEventListener('main:hide', this.handleHide)
    window.addEventListener('main:quit', this.handleQuit)
    window.addEventListener('main:refresh', this.handleRefresh)

    ipc.mount()

    const { dispatch } = this.props

    dataAPI.loadAllStorages()
      .then(storageMap => {
        return dispatch(disaptch => {
          dispatch({
            type: 'LOAD_ALL_STORAGES',
            payload: {
              storageMap
            }
          })
        })
      })
      .then(hideLoadingScreen)
  }

  componentWillUnmount () {
    window.removeEventListener('mouseup', this.handleSliderMouseUp)
    window.removeEventListener('mousemove', this.handleSliderMouseMove)

    window.removeEventListener('main:hide', this.handleHide)
    window.removeEventListener('main:quit', this.handleQuit)
    window.removeEventListener('main:refresh', this.handleRefresh)

    ipc.unmount()
  }

  componentDidUpdate (prevProps) {
    if (prevProps.config.get('theme') !== this.props.config.get('theme')) {
      this.forceUpdate()
    }
  }

  handleHide = e => {
    remote.getCurrentWindow().hide()
  }

  handleQuit = e => {
    remote.app.quit()
  }

  handleRefresh = e => {
    remote.getCurrentWindow().reload()
  }

  handleSearchChange = newValue => {
    this.setState({
      search: newValue
    })
  }

  render () {
    const { storageMap, config, status, keymap } = this.props
    return (
      <ThemeProvider theme={config.get('theme') === 'dark' ? themes.dark : themes.default}>
        <Root>

          <TitleBar
            storageMap={storageMap}
            status={status}
            onSearchChange={this.handleSearchChange}
            search={this.state.search}
          />

          <Body>
            <Nav storageMap={storageMap}
              width={this.state.navWidth}
              keymap={keymap}
            />

            <Slider
              onMouseDown={this.handleSliderMouseDown}
              onMouseUp={this.handleSliderMouseUp}
            >
              <SliderLine
                active={this.state.isSliderActive}
              />
            </Slider>

            <Content>
              <NoteList
                {...this.props}
                search={this.state.search}
              />
            </Content>
          </Body>

        </Root>
      </ThemeProvider>
    )
  }
}

Main.propTypes = {
}

Main.contextTypes = {
  store: PropTypes.shape({
    dispatch: PropTypes.func
  })
}

export default connect(x => x)(Main)
