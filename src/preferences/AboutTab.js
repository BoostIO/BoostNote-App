import React from 'react'
import styled from 'styled-components'

const { remote, shell } = require('electron')
const APP_VERSION = remote.app.getVersion()

const Root = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: ${p => p.theme.color};
  background-color: ${p => p.theme.backgroundColor};
  img.icon {
    width: 200px;
  }
  .version {
    font-size: 2em;
    margin-bottom: 15px;
  }
  a {
    color: ${p => p.theme.activeColor}
  }
  p {
    margin: 0 0 15px;
  }
`

class AboutTab extends React.Component {
  handleAnchorClick = e => {
    e.preventDefault()
    shell.openExternal(e.target.href)
  }

  render () {
    return <Root>
      <img className='icon'
        src='../../resources/icon.png'
        draggable='false'
      />
      <div className='version'>Inpad v{APP_VERSION}</div>
      <p>Developed by <a onClick={this.handleAnchorClick}href='https://github.com/sarah-seo'>Sarah Seo</a></p>
      <p>Published under MIT License</p>
      <p>Found bug? <a onClick={this.handleAnchorClick}href='https://github.com/sarah-seo/inpad/issues'>https://github.com/sarah-seo/inpad/issues</a></p>
    </Root>
  }
}

AboutTab.propTypes = {
}

export default AboutTab
