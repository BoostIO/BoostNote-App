import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import styled, { ThemeProvider } from 'styled-components'
import TitleBar from './TitleBar'
import themes from './lib/themes'
import Nav from './Nav/Nav'
import { Map } from 'immutable'
import StorageManager from './lib/StorageManager'

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
  top: 36px;
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
        navWidth: e.clientX
      })
    }

    this.handleSliderMouseUp = e => {
      window.removeEventListener('mouseup', this.handleSliderMouseUp)
      window.removeEventListener('mousemove', this.handleSliderMouseMove)

      this.setState({
        isSliderActive: false,
        navWidth: e.clientX
      })
    }
  }

  componentWillUnmount () {
    window.removeEventListener('mouseup', this.handleSliderMouseUp)
    window.removeEventListener('mousemove', this.handleSliderMouseMove)
  }

  getChildContext () {
    return {
      status: this.props.status
    }
  }

  componentDidMount () {
    const { dispatch } = this.props
    StorageManager.init()
      .then(() => {
        return StorageManager.loadAll()
      })
      .then((data) => {
        dispatch({
          type: 'LOAD_ALL_STORAGES',
          payload: {
            storageMap: data
          }
        })
      })
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

Main.childContextTypes = {
  status: PropTypes.instanceOf(Map)
}

export default connect((x) => x)(Main)
