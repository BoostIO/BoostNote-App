import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import styled, { ThemeProvider } from 'styled-components'
import TitleBar from './TitleBar'
import themes from './lib/themes'
import Nav from './Nav/Nav'
import { Map } from 'immutable'
import StorageManager from './lib/StorageManager'
import { NAV_MIN_WIDTH } from 'main/lib/consts'
import ipc from './lib/ipc'

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
    window.addEventListener('main:new-note', this.handleNewNote)
    window.addEventListener('main:new-folder', this.handleNewFolder)
    window.addEventListener('main:delete', this.handleDelete)
    window.addEventListener('main:focus-search', this.handleFocusSearch)
    window.addEventListener('main:focus-nav', this.handleFocusNav)
    window.addEventListener('main:focus-list', this.handleFocusList)
    window.addEventListener('main:focus-detail', this.handleFocusDetail)
    window.addEventListener('main:find', this.handleFind)

    ipc.mount()

    const { dispatch } = this.props

    StorageManager.loadAll()
      .then((data) => {
        dispatch({
          type: 'LOAD_ALL_STORAGES',
          payload: {
            storageMap: data
          }
        })
      })
  }

  componentWillUnmount () {
    window.removeEventListener('mouseup', this.handleSliderMouseUp)
    window.removeEventListener('mousemove', this.handleSliderMouseMove)

    window.removeEventListener('main:new-note', this.handleNewNote)
    window.removeEventListener('main:new-folder', this.handleNewFolder)
    window.removeEventListener('main:delete', this.handleDelete)
    window.removeEventListener('main:focus-search', this.handleFocusSearch)
    window.removeEventListener('main:focus-nav', this.handleFocusNav)
    window.removeEventListener('main:focus-list', this.handleFocusList)
    window.removeEventListener('main:focus-detail', this.handleFocusDetail)
    window.removeEventListener('main:find', this.handleFind)

    ipc.unmount()
  }

  getChildContext () {
    return {
      status: this.props.status
    }
  }

  handleNewNote = e => {
    window.dispatchEvent(new window.CustomEvent('title:new-note'))
  }

  handleNewFolder = e => {
    window.dispatchEvent(new window.CustomEvent('nav:new-folder'))
    console.log('dfs')
  }

  handleDelete = e => {
    window.dispatchEvent(new window.CustomEvent('nav:delete'))
    window.dispatchEvent(new window.CustomEvent('list:delete'))
  }

  handleFocusSearch = e => {
    window.dispatchEvent(new window.CustomEvent('title:focus-search'))
  }

  handleFocusNav = e => {
    window.dispatchEvent(new window.CustomEvent('nav:focus'))
  }

  handleFocusList = e => {
    window.dispatchEvent(new window.CustomEvent('list:focus'))
  }

  handleFocusDetail = e => {
    window.dispatchEvent(new window.CustomEvent('detail:focus'))
  }

  handleFind = e => {
    window.dispatchEvent(new window.CustomEvent('detail:find'))
  }

  render () {
    let { storageMap } = this.props
    return (
      <ThemeProvider theme={themes.default}>
        <Root>

          <TitleBar />

          <Body>
            <Nav storageMap={storageMap} width={this.state.navWidth} />

            <Slider
              onMouseDown={this.handleSliderMouseDown}
              onMouseUp={this.handleSliderMouseUp}
            >
              <SliderLine
                active={this.state.isSliderActive}
              />
            </Slider>

            <Content>
              {this.props.children}
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

Main.childContextTypes = {
  status: PropTypes.instanceOf(Map)
}

export default connect(x => x)(Main)
