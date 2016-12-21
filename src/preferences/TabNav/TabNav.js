import React, { PropTypes } from 'react'
import styled from 'styled-components'
import { routerShape } from 'react-router'
import TabItem from './TabItem'

const Root = styled.div`
  display: flex;
  justify-content: center;
  height: 60px;
  border-bottom: ${p => p.theme.border};
  background-color: ${p => p.theme.navBackgroundColor};
  .tab {
    display: block;
    width: 90px;
    padding: 0 5px;
    height: 60px;
    text-align: center;
    font-size: 12px;
    display: flex;
    justify-content: center;
    align-content: center;
    flex-direction: column;
    -webkit-user-select: none;
    cursor: pointer;
    border: none;
    outline: none;
    background-color: transparent;
    .Octicon {
      margin: 0 auto;
      font-size: 30px;
      width: 100%;
    }
    .label {
      width: 100%;
    }
    &:hover {
      background-color: ${p => p.theme.buttonHoverColor};
    }
    &:active {
      background-color: ${p => p.theme.buttonActiveColor};
    }
    &.active {
      background-color: ${p => p.theme.activeColor};
      color: ${p => p.theme.inverseColor};
      .Octicon {
        fill: ${p => p.theme.inverseColor};
      }
    }
  }
`

const tabs = [
  {
    label: 'Settings',
    path: 'settings',
    icon: 'settings'
  },
  {
    label: 'Keybindings',
    path: 'keybindings',
    icon: 'keyboard'
  },
  {
    label: 'About',
    path: 'about',
    icon: 'info'
  }
]

class TabNav extends React.Component {
  render () {
    const tabList = tabs
      .map(tab => {
        return <TabItem
          key={tab.path}
          {...tab}
        />
      })
    return <Root>
      {tabList}
    </Root>
  }
}

TabNav.propTypes = {
}

TabNav.contextTypes = {
  router: routerShape
}

export default TabNav
