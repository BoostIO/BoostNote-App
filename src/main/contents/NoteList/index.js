import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Map } from 'immutable'
import Octicon from 'components/Octicon'

const Root = styled.div`
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`

const Left = styled.div`
  width: ${p => p.width}px;
  min-width: 150px;
`

const LeftMenu = styled.div`
  border-bottom: ${p => p.theme.border}
`

const LeftList = styled.div`

`

const LeftListItem = styled.div`

`

const Slider = styled.div`
  position: relative;
  width: 5px;
  cursor: col-resize;
  display: flex;
  margin-left: -2px;
  margin-right: -2px;
`

const SliderLine = styled.div`
  margin-left: 2px;
  width: 1px;
  background-color: ${p => p.active
    ? p.theme.activeBorderColor
    : p.theme.borderColor};
`

const Detail = styled.div`
`

class NoteList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      listWidth: props.status.get('noteListWidth')
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
        listWidth: e.clientX - this.props.status.get('navWidth')
      })
    }

    this.handleSliderMouseUp = e => {
      window.removeEventListener('mouseup', this.handleSliderMouseUp)
      window.removeEventListener('mousemove', this.handleSliderMouseMove)

      this.setState({
        isSliderActive: false,
        listWidth: e.clientX - this.props.status.get('navWidth')
      })
    }
  }

  render () {
    return (
      <Root>
        <Left width={this.state.listWidth}>
          <LeftMenu>
            Sort By <select />
            <button><Octicon icon='grabber' size='12' /></button>
            <button><Octicon icon='three-bars' size='12' /></button>
          </LeftMenu>
          <LeftList>
          </LeftList>
        </Left>
        <Slider
          onMouseDown={this.handleSliderMouseDown}
          onMouseUp={this.handleSliderMouseUp}
        >
          <SliderLine
            active={this.state.isSliderActive}
          />
        </Slider>
        <Detail />
      </Root>
    )
  }
}

NoteList.propTypes = {
}

NoteList.contextTypes = {
  status: PropTypes.instanceOf(Map)
}

export default connect((x) => x)(NoteList)
