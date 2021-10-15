import React from 'react'
import ReactDOM from 'react-dom'

export interface PortalProps {
  domTarget: Element | null
  children: React.ReactNode
}

const Portal: React.FC<PortalProps> = ({ domTarget, children }) => {
  if (domTarget == null) {
    return null
  }

  return ReactDOM.createPortal(children, domTarget)
}

export default Portal
