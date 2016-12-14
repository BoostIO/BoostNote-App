import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import ImmutablePropTypes from 'react-immutable-proptypes'
import styled from 'styled-components'
import { Map } from 'immutable'
import Octicon from 'components/Octicon'
import Detail from './Detail'
import { isFinallyBlurred } from 'lib/util'
import Dialog from 'main/lib/Dialog'
import StorageManager from 'main/lib/StorageManager'
import moment from 'moment'
import NoteItem from './NoteItem'
import { LIST_MIN_WIDTH } from 'main/lib/consts'
import _ from 'lodash'
import CodeMirror from 'codemirror'

const Root = styled.div`
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
`

const Left = styled.div`
  min-width: ${LIST_MIN_WIDTH}px;
  display: flex;
  flex-direction: column;
  outline: none;
`

const LeftMenu = styled.div`
  border-bottom: ${p => p.theme.border};
  display: flex;
  height: 20px;
`

const LeftMenuSortSelect = styled.div`
  flex: 1;
  display: flex;
  line-height: 20px;
  color: ${p => p.theme.inactiveColor};
  select {
    width: 100%;
    font-size: 10px;
    outline: none;
    border: none;
    background: transparent;
    height: 20px;
    color: ${p => p.theme.inactiveColor};
    &:active {
      color: ${p => p.theme.activeColor};
    }
  }
`

const LeftMenuButton = styled.button`
  ${p => p.theme.button};
  border-width: 0 0 0 1px;
  width: 24px;
  ${p => p.active ? `fill: ${p.theme.activeColor};` : ''}
  border-radius: 0;
`

const LeftList = styled.div`
  flex: 1;
  overflow-y: auto;
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

const Right = styled.div`
  flex: 1;
  position: relative;
  outline: none;
  ${p => p.ignore ? 'pointer-events: none;' : ''}
`

class NoteList extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      listWidth: props.status.get('noteListWidth'),
      listStyle: props.status.get('noteListStyle'),
      listSort: props.status.get('noteListSort'),
      isRightFocused: false,
      isLeftFocused: false
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
    const width = e.clientX - this.props.status.get('navWidth')
    this.setState({
      listWidth: width > LIST_MIN_WIDTH ? width : LIST_MIN_WIDTH
    })
  }

  handleSliderMouseUp = e => {
    window.removeEventListener('mouseup', this.handleSliderMouseUp)
    window.removeEventListener('mousemove', this.handleSliderMouseMove)

    let width = e.clientX - this.props.status.get('navWidth')
    width = width > LIST_MIN_WIDTH ? width : LIST_MIN_WIDTH

    this.setState({
      isSliderActive: false,
      listWidth: width
    }, () => {
      const { store, status } = this.context

      store.dispatch({
        type: 'UPDATE_STATUS',
        payload: {
          status: status.set('noteListWidth', width)
        }
      })
    })
  }

  componentDidUpdate () {
    const { location } = this.props
    const { router } = this.context

    const needsRedirectToFirstNote = this.noteListMap.size > 0 && this.noteListMap.get(location.query.key) == null
    if (needsRedirectToFirstNote) {
      router.push({
        pathname: location.pathname,
        query: {
          key: this.noteListMap.keySeq().first()
        }
      })
    }

    this.setRefreshTimer()
  }

  componentDidMount () {
    window.addEventListener('list:focus', this.handleWindowFocus)
    window.addEventListener('list:up', this.handleWindowUp)
    window.addEventListener('list:down', this.handleWindowDown)
    window.addEventListener('list:delete', this.handleWindowDelete)
  }

  componentWillUnmount () {
    this.invalidateRefreshTimer()

    window.removeEventListener('list:focus', this.handleWindowFocus)
    window.removeEventListener('list:up', this.handleWindowUp)
    window.removeEventListener('list:down', this.handleWindowDown)
    window.removeEventListener('list:delete', this.handleWindowDelete)
  }

  handleLeftKeyDown = e => {
    const keyName = CodeMirror.keyName(e)
    const { keymap } = this.context

    if (keymap.hasIn(['list', keyName])) {
      e.preventDefault()
      window.dispatchEvent(new window.CustomEvent(keymap.getIn(['list', keyName])))
    }
  }

  handleWindowUp = e => {
    this.move(-1)
  }

  handleWindowDown = e => {
    this.move(1)
  }

  handleWindowDelete = e => {
    if ((this.state.isLeftFocused || this.state.isRightFocused) && this.noteListMap.size > 0) {
      const { router, store } = this.context
      const { storageName } = router.params
      const { key } = router.location.query

      const nextNoteKey = this.getNextKey()

      Dialog.showMessageBox({
        message: `Are you sure you want to delete the selected note?`,
        buttons: ['Delete Note', 'Cancel']
      }, (index) => {
        if (index === 0) {
          StorageManager.deleteNote(storageName, key)
            .then(() => {
              router.push({
                pathname: router.location.pathname,
                query: {
                  key: nextNoteKey
                }
              })
            })
            .then(() => {
              store.dispatch({
                type: 'DELETE_NOTE',
                payload: {
                  storageName,
                  noteId: key
                }
              })
            })
        }
      })
    }
  }

  handleWindowFocus = e => {
    this.left.focus()
  }

  handleRightFocus = e => {
    if (!this.state.isRightFocused) {
      this.setState({
        isRightFocused: true
      })
    }
  }

  handleRightBlur = e => {
    if (isFinallyBlurred(e, this.right)) {
      this.setState({
        isRightFocused: false
      })
    }
  }

  handleLeftFocus = e => {
    if (!this.state.isLeftFocused) {
      this.setState({
        isLeftFocused: true
      })
    }
  }

  handleLeftBlur = e => {
    if (isFinallyBlurred(e, this.left)) {
      this.setState({
        isLeftFocused: false
      })
    }
  }

  handleSortSelectChange = e => {
    let listSort = e.target.value
    this.setState({
      listSort
    }, () => {
      const { store, status } = this.context

      store.dispatch({
        type: 'UPDATE_STATUS',
        payload: {
          status: status.set('noteListSort', listSort)
        }
      })
    })
  }

  handleCompactButtonClick = e => {
    const listStyle = 'COMPACT'
    this.setState({
      listStyle
    }, () => {
      const { store, status } = this.context

      store.dispatch({
        type: 'UPDATE_STATUS',
        payload: {
          status: status.set('noteListStyle', listStyle)
        }
      })
    })
  }

  handleNormalButtonClick = e => {
    const listStyle = 'NORMAL'
    this.setState({
      listStyle
    }, () => {
      const { store, status } = this.context

      store.dispatch({
        type: 'UPDATE_STATUS',
        payload: {
          status: status.set('noteListStyle', listStyle)
        }
      })
    })
  }

  handleRightKeyDown = e => {
    const keyName = CodeMirror.keyName(e)
    const { keymap } = this.context

    if (keymap.hasIn(['detail', keyName])) {
      e.preventDefault()
      window.dispatchEvent(new window.CustomEvent(keymap.getIn(['detail', keyName])))
    }
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

  getSortMethod () {
    switch (this.state.listSort) {
      case 'CREATED_AT':
        return (a, b) => {
          return moment(b.get('createdAt')).toDate() - moment(a.get('createdAt')).toDate()
        }
      case 'ALPHABET':
        return (a, b) => {
          const aTitle = _.isString(a.get('title')) ? a.get('title') : ''
          const bTitle = _.isString(b.get('title')) ? b.get('title') : ''
          return aTitle.localeCompare(bTitle)
        }
      default:
      case 'UPDATED_AT':
        return (a, b) => {
          return moment(b.get('updatedAt')).toDate() - moment(a.get('updatedAt')).toDate()
        }
    }
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
        .map(noteId => {
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

    return notes.sort(this.getSortMethod())
  }

  move (offset = 1) {
    const { router } = this.context
    const { location } = this.props

    const { key } = router.location.query

    const noteMapKeys = this.noteListMap.keySeq()
    const currentIndex = noteMapKeys.keyOf(key)
    const nextIndex = currentIndex + offset

    if (nextIndex > -1 && nextIndex < this.noteListMap.size) {
      router.push({
        pathname: location.pathname,
        query: {
          key: noteMapKeys.get(nextIndex)
        }
      })
    }
  }

  getNextKey = () => {
    const { router } = this.context
    const { key } = router.location.query

    const noteMapKeys = this.noteListMap.keySeq()
    const targetIndex = noteMapKeys.keyOf(key)
    const nextIndex = targetIndex + 1 < noteMapKeys.size
      ? targetIndex + 1
      : targetIndex - 1
    return noteMapKeys.get(nextIndex)
  }

  render () {
    const { location } = this.props
    const noteListMap = this.noteListMap = this.getNotes()

    const noteList = noteListMap
      .map((note, key) => {
        let isActive = location.query.key === key
        return <NoteItem
          key={key}
          compact={this.state.listStyle === 'COMPACT'}
          active={isActive}
          isFocused={this.state.isLeftFocused}
          noteKey={key}
          note={note}
          getNextKey={this.getNextKey}
        />
      })
      .toArray()

    const activeNote = location.query.key == null
      ? noteListMap.first()
      : noteListMap.get(location.query.key)

    return (
      <Root>
        <Left
          style={{width: this.state.listWidth}}
          innerRef={c => (this.left = c)}
          tabIndex='0'
          onKeyDown={this.handleLeftKeyDown}
          onFocus={this.handleLeftFocus}
          onBlur={this.handleLeftBlur}
        >
          <LeftMenu>
            <LeftMenuSortSelect>
              <select
                title='Sort by'
                value={this.state.listSort}
                onChange={this.handleSortSelectChange}
              >
                <option value='CREATED_AT'>Ceated At</option>
                <option value='UPDATED_AT'>Updated At</option>
                <option value='ALPHABET'>Alphabetical</option>
              </select>
            </LeftMenuSortSelect>
            <LeftMenuButton
              title='Compact list'
              active={this.state.listStyle === 'COMPACT'}
              onClick={this.handleCompactButtonClick}
            >
              <Octicon icon='grabber' size='12' />
            </LeftMenuButton>
            <LeftMenuButton
              title='Normal list'
              active={this.state.listStyle === 'NORMAL'}
              onClick={this.handleNormalButtonClick}
            >
              <Octicon icon='three-bars' size='12' />
            </LeftMenuButton>
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
        <Right
          innerRef={c => (this.right = c)}
          tabIndex='0'
          onKeyDown={this.handleRightKeyDown}
          onFocus={this.handleRightFocus}
          onBlur={this.handleRightBlur}
          ignore={this.state.isSliderActive}
        >
          {activeNote != null
            ? <Detail
              ref={c => (this.detail = c)}
              noteKey={location.query.key}
              note={activeNote}
            />
            // TODO: set some styles to Empty page
            : <div>No note.</div>
          }
        </Right>

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
  store: PropTypes.shape({
    dispatch: PropTypes.func
  }),
  status: PropTypes.instanceOf(Map),
  keymap: ImmutablePropTypes.mapContains({
    list: ImmutablePropTypes.map
  })
}

export default connect(x => x)(NoteList)
