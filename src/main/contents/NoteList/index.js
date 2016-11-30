import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { Map } from 'immutable'
import Octicon from 'components/Octicon'
import _ from 'lodash'
import Color from 'color'
import Detail from './Detail'

const Root = styled.div`
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`

const Left = styled.div`
  min-width: 150px;
  display: flex;
  flex-direction: column;
`

const LeftMenu = styled.div`
  border-bottom: ${p => p.theme.border};
`

const LeftList = styled.div`
  overflow-y: auto;
`

const LeftListItem = styled.div`
  border-bottom: ${p => p.theme.border}
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.15s;
  &:hover {
    background-color: ${p => Color(p.theme.activeColor).clearer(0.8).rgbString()};
  }
  &.active, &:active {
    background-color: ${p => p.theme.activeColor};
    color: ${p => p.theme.inverseColor};
  }
`

const Slider = styled.div`
  position: relative;
  width: 5px;
  cursor: col-resize;
  display: flex;
  margin-left: -2px;
  margin-right: -2px;
  z-index: 10;
`

const SliderLine = styled.div`
  margin-left: 2px;
  width: 1px;
  background-color: ${p => p.active
    ? p.theme.activeBorderColor
    : p.theme.borderColor};
`

class NoteList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      listWidth: props.status.get('noteListWidth')
    }

    this.refreshTimer = null
  }

  handleSliderMouseDown = e => {
    window.addEventListener('mouseup', this.handleSliderMouseUp)
    window.addEventListener('mousemove', this.handleSliderMouseMove)
    this.setState({
      isSliderActive: true
    })
  }

  handleSliderMouseMove = e => {
    this.setState({
      listWidth: e.clientX - this.props.status.get('navWidth')
    })
  }

  handleSliderMouseUp = e => {
    window.removeEventListener('mouseup', this.handleSliderMouseUp)
    window.removeEventListener('mousemove', this.handleSliderMouseMove)

    this.setState({
      isSliderActive: false,
      listWidth: e.clientX - this.props.status.get('navWidth')
    })
  }

  handleListItemClick = (e, key) => {
    const { router } = this.context

    router.push({
      pathname: router.location.pathname,
      query: {
        key
      }
    })
  }

  componentDidUpdate () {
    const { location } = this.props
    const { router } = this.context

    const needsRedirectFirstNote = this.noteListMap.size > 0 && this.noteListMap.get(location.query.key) == null
    if (needsRedirectFirstNote) {
      router.push({
        pathname: location.pathname,
        query: {
          key: this.noteListMap.keySeq().first()
        }
      })
    }

    this.setRefreshTimer()
  }

  componentWillUnmount () {
    this.invalidateRefreshTimer()
  }

  setRefreshTimer () {
    this.invalidateRefreshTimer()
    this.refreshTimer = window.setTimeout(() => {
      this.forceUpdate()
    }, 60 * 1000)
  }

  invalidateRefreshTimer () {
    window.clearTimeout(this.refreshTimer)
  }

  getNotes () {
    const { storageMap, params } = this.props
    let notes = new Map()

    if (params.folderName != null) {
      let noteSet = storageMap
        .getIn([
          params.storageName,
          'folders',
          params.folderName,
          'notes'
        ])

      if (noteSet == null) return new Map()

      notes = noteSet
        .map((noteId) => {
          return [
            noteId,
            storageMap
              .getIn([params.storageName, 'notes', noteId])
          ]
        })
        .toArray()
      notes = new Map(notes)
    } else if (params.storageName != null) {
      notes = storageMap.getIn([params.storageName, 'notes'])
      if (notes == null) return new Map()
    } else {
      notes = new Map()
    }
    return notes
  }

  render () {
    const { location } = this.props
    const noteListMap = this.noteListMap = this.getNotes()

    const noteList = noteListMap
      .map((note, key) => {
        let title = note.get('title')
        let isValidTitle = _.isString(title) && title.trim().length > 0
        let isActive = location.query.key === key
        return <LeftListItem
          key={key}
          onClick={(e) => this.handleListItemClick(e, key)}
          className={isActive && 'active'}
        >
          {isValidTitle ? title : <span>Unnamed</span>}
        </LeftListItem>
      })
      .toArray()

    const activeNote = noteListMap.get(location.query.key)

    return (
      <Root>
        <Left
          style={{width: this.state.listWidth}}
        >
          <LeftMenu>
            Sort By <select />
            <button><Octicon icon='grabber' size='12' /></button>
            <button><Octicon icon='three-bars' size='12' /></button>
          </LeftMenu>
          <LeftList>
            {noteList}
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
        {location.query.key != null && activeNote != null
          ? <Detail
            noteKey={location.query.key}
            note={activeNote}
          />
          : <div>No note.</div>
        }

      </Root>
    )
  }
}

NoteList.propTypes = {
}

NoteList.contextTypes = {
  router: PropTypes.shape({
    push: PropTypes.func
  }),
  status: PropTypes.instanceOf(Map)
}

export default connect((x) => x)(NoteList)
