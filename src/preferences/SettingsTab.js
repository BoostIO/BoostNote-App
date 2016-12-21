import React, { PropTypes } from 'react'
import styled from 'styled-components'
import ImmutablePropTypes from 'react-immutable-proptypes'
import Octicon from 'components/Octicon'
import { CODEMIRROR_THEMES, DEFAULT_CONFIG } from 'lib/consts'
import _ from 'lodash'

const NORMAL_MESSAGE = 'NORMAL_MESSAGE'
const ERROR_MESSAGE = 'ERROR_MESSAGE'
const CONFIRM_MESSAGE = 'CONFIRM_MESSAGE'

const NOTHING_CHANGED = 'Nothing changed.'
const CHANGED = 'Apply to save changes.'
const APPLIED = 'Successfully applied.'

const Root = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  &>.body {
    overflow-y: auto;
    flex: 1;
  }
  &>.body .heading {
    -webkit-user-select: none;
    font-size: 16px;
    border-bottom: 2px solid ${p => p.theme.activeColor}
    width: 70%;
    margin: 20px auto 10px;
    line-height: 30px;
    cursor: default;
  }
  &>.body .section {
    height: 40px;
    line-height: 40px;
    margin-bottom: 5px;
    display: flex;
    &:last-child {
      margin-bottom: 35px;
    }
    .label {
      -webkit-user-select: none;
      text-align: right;
      width: 40%;
      margin: 0 25px 0 0;
      font-size: 12px;
      color: ${p => p.theme.color};
      cursor: default;
    }
    .input {
      flex: 1;
    }
    .input select, .input input {
      border: ${p => p.theme.border};
      border-radius: 4px;
      height: 24px;
      width: 60%;
      padding: 0 5px;
      background-color: transparent;
      box-sizing: border-box;
      outline: none;
      &:focus {
        border-color: ${p => p.theme.activeColor}
      }
    }
  }
  &>.footer {
    height: 40px;
    padding: 5px;
    border-top: ${p => p.theme.border};
    box-sizing: border-box;
    display: flex;
    .message {
      flex: 1;
      font-size: 12px;
      color: ${p => p.theme.inactiveColor};
      line-height: 30px;
      padding: 0 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .control {
    }
    .control button {
      ${p => p.theme.button}
      height: 30px;
      padding: 0 10px;
      margin-left: 5px;
      min-width: 80px;
      &.submit {
        background-color: ${p => p.theme.activeColor};
        color: ${p => p.theme.inverseColor};
        border: none;
        border-radius: 4px;
        outline: none;
        .Octicon {
          fill: ${p => p.theme.inverseColor};
        }
      }
    }
  }
`

class SettingsTab extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      messageType: NORMAL_MESSAGE,
      message: NOTHING_CHANGED,
      isChanged: false,
      config: props.config
    }
  }

  componentWillReceiveProps (nextProps) {
    if (!nextProps.config.equals(this.props.config)) {
      this.setState({
        config: nextProps.config
      })
    }
  }

  handleChange = e => {
    const newConfig = this.state.config.merge({
      theme: this.theme.value,

      editorFontSize: this.editorFontSize.value,
      editorFontFamily: this.editorFontFamily.value,
      editorTheme: this.editorTheme.value,
      editorIndentStyle: this.editorIndentStyle.value,
      editorIndentSize: this.editorIndentSize.value,

      previewFontSize: this.previewFontSize.value,
      previewFontFamily: this.previewFontFamily.value,
      previewCodeBlockTheme: this.previewCodeBlockTheme.value,
      previewCodeBlockFontFamily: this.previewCodeBlockFontFamily.value
    })

    const isChanged = this.checkIfChanged(newConfig)

    this.setState({
      config: newConfig,
      isChanged,
      message: isChanged
        ? CHANGED
        : NOTHING_CHANGED
    })
  }

  handleDefaultButtonClick = e => {
    const newConfig = DEFAULT_CONFIG

    const isChanged = this.checkIfChanged(newConfig)

    this.setState({
      config: newConfig,
      isChanged,
      message: isChanged
        ? CHANGED
        : NOTHING_CHANGED
    })
  }

  handleResetButtonClick = e => {
    this.setState({
      config: this.props.config,
      isChanged: false,
      message: NOTHING_CHANGED
    })
  }

  handleApplyButtonClick = e => {
    const { store } = this.context

    try {
      const sanitizedConfig = this.sanitizeConfig(this.state.config)

      store.dispatch({
        type: 'UPDATE_CONFIG',
        payload: {
          config: sanitizedConfig
        }
      })

      this.setState({
        config: sanitizedConfig,
        isChanged: false,
        messageType: CONFIRM_MESSAGE,
        message: APPLIED
      })
    } catch (err) {
      console.warn(err)
      this.setState({
        messageType: ERROR_MESSAGE,
        message: err.message
      })
      return
    }
  }

  checkIfChanged (newConfig) {
    return !newConfig.every((v, k) => {
      return v.toString() === this.props.config.get(k).toString()
    })
  }

  sanitizeConfig (config) {
    return config.map((v, k) => {
      switch (k) {
        case 'editorFontSize':
          return _.clamp(v, 1, 100)
        case 'editorIndentSize':
          return _.clamp(v, 1, 10)
        case 'previewFontSize':
          return _.clamp(v, 1, 100)
        // Font Family should be stripped because it will be injected directly to style.
        case 'editorFontFamily':
        case 'previewFontFamily':
        case 'previewCodeBlockFontFamily':
          return v.replace(/:;{}/g, '')
      }
      return v
    })
  }

  render () {
    const config = this.state.config.toJS()

    const codeMirrorThemeOptions = CODEMIRROR_THEMES.map(theme => {
      return <option
        key={theme.value}
        value={theme.value}
      >
        {theme.label}
      </option>
    })

    return <Root>
      <div className='body'>
        <div className='heading'>
          General
        </div>

        <div className='section'>
          <div className='label'>Theme</div>
          <div className='input'>
            <select
              value={config.theme}
              ref={c => (this.theme = c)}
              onChange={this.handleChange}
            >
              <option value='default'>Default</option>
              <option value='dark'>Dark</option>
            </select>
          </div>
        </div>

        <div className='heading'>
          Editor
        </div>

        <div className='section'>
          <div className='label'>Font Size</div>
          <div className='input'>
            <input
              value={config.editorFontSize}
              ref={c => (this.editorFontSize = c)}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className='section'>
          <div className='label'>Font Family</div>
          <div className='input'>
            <input
              value={config.editorFontFamily}
              ref={c => (this.editorFontFamily = c)}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className='section'>
          <div className='label'>Theme</div>
          <div className='input'>
            <select
              value={config.editorTheme}
              ref={c => (this.editorTheme = c)}
              onChange={this.handleChange}
            >
              {codeMirrorThemeOptions}
            </select>
          </div>
        </div>

        <div className='section'>
          <div className='label'>Indent Style</div>
          <div className='input'>
            <select
              value={config.editorIndentStyle}
              ref={c => (this.editorIndentStyle = c)}
              onChange={this.handleChange}
            >
              <option value='space'>Space</option>
              <option value='tab'>Tab</option>
            </select>
          </div>
        </div>

        <div className='section'>
          <div className='label'>Indent Size</div>
          <div className='input'>
            <input
              value={config.editorIndentSize}
              ref={c => (this.editorIndentSize = c)}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className='heading'>
          Preview
        </div>

        <div className='section'>
          <div className='label'>Font Size</div>
          <div className='input'>
            <input
              value={config.previewFontSize}
              ref={c => (this.previewFontSize = c)}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className='section'>
          <div className='label'>Font Family</div>
          <div className='input'>
            <input
              value={config.previewFontFamily}
              ref={c => (this.previewFontFamily = c)}
              onChange={this.handleChange}
            />
          </div>
        </div>

        <div className='section'>
          <div className='label'>Code Block Theme</div>
          <div className='input'>
            <select
              value={config.previewCodeBlockTheme}
              ref={c => (this.previewCodeBlockTheme = c)}
              onChange={this.handleChange}
            >
              {codeMirrorThemeOptions}
            </select>
          </div>
        </div>

        <div className='section'>
          <div className='label'>Code Block Font Family</div>
          <div className='input'>
            <input
              value={config.previewCodeBlockFontFamily}
              ref={c => (this.previewCodeBlockFontFamily = c)}
              onChange={this.handleChange}
            />
          </div>
        </div>
      </div>
      <div className='footer'>
        <div className='message'>
          {this.state.message}
        </div>
        <div className='control'>
          <button className='reset'
            onClick={this.handleDefaultButtonClick}
          >
            <Octicon icon='history' /> Set as Default
          </button>
          <button
            className='reset'
            onClick={this.handleResetButtonClick}
            disabled={!this.state.isChanged}
          >
            <Octicon icon='circle-slash' /> Discard Changes
          </button>
          <button
            className='submit'
            onClick={this.handleApplyButtonClick}
            disabled={!this.state.isChanged}
          >
            <Octicon icon='check' /> Apply
          </button>
        </div>
      </div>
    </Root>
  }
}

SettingsTab.contextTypes = {
  store: PropTypes.shape({
    dispatch: PropTypes.func
  })
}

SettingsTab.propTypes = {
  config: ImmutablePropTypes.mapContains({
    theme: PropTypes.string
  })
}

export default SettingsTab

