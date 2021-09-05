import React from 'react'
import { ExternalLink } from '../../../../design/components/atoms/Link'

interface HyperlinkCellProps {
  href: string
  label?: React.ReactNode
}

const HyperlinkCell = ({ href, label }: HyperlinkCellProps) => {
  if (href === '') {
    return null
  }
  return (
    <div>
      <ExternalLink showIcon={true} href={href}>
        {label != null ? label : href}
      </ExternalLink>
    </div>
  )
}

export default HyperlinkCell
