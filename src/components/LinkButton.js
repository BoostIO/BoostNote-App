import React, { PropTypes } from 'react'
import _ from 'lodash'

class LinkButton extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
    }

    this.handleClick = (e) => {
      this.context.router.push(this.props.to)
    }
  }

  render () {
    let { to, className } = this.props
    const { router } = this.context
    className = _.isString(className)
      ? className
      : ''
    className += router.isActive(to) ? ' active' : ''

    return (
      <button
        onClick={this.handleClick}
        {..._.omit(this.props, ['active', 'className'])}
        className={className}
      />
    )
  }
}

LinkButton.propTypes = {
}

LinkButton.contextTypes = {
  router: PropTypes.shape({
    push: PropTypes.func
  })
}

export default LinkButton
