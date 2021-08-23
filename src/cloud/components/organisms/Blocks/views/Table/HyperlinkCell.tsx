import React from 'react'

interface HyperlinkCellProps {
  href: string
  label?: string
}

const HyperlinkCell = ({ href, label }: HyperlinkCellProps) => {
  return (
    <div>
      <a href={href}>{label != null ? label : href}</a>
    </div>
  )
}

export default HyperlinkCell
