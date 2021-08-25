import React from 'react'
import ReactDOM from 'react-dom'

export interface PortalProps {
  target: Element
  children: React.ReactNode
}

const Portal: React.FC<PortalProps> = ({ target, children }) => {
  return ReactDOM.createPortal(children, target)
}

export default Portal
