import React, { PropTypes } from 'react'
import styled from 'styled-components'
import Octicon from 'components/Octicon'
import LinkButton from 'components/LinkButton'

class TabItem extends React.Component {
  render () {
    const { icon, label, path } = this.props

    return <LinkButton
      className='tab'
      to={'/tabs/' + path}
    >
      <Octicon icon={icon} />
      <div className='label'>{label}</div>
    </LinkButton>
  }
}

TabItem.propTypes = {
}

export default TabItem
