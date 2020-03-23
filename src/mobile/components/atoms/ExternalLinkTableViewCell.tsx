import React from 'react'
import TableViewCell from './TableViewCell'
import { openNew } from '../../../lib/platform'
import { mdiOpenInNew } from '@mdi/js'

interface ExternalLinkTableViewCellProps {
  url: string
}

const ExternalLinkTableViewCell: React.FC<ExternalLinkTableViewCellProps> = ({
  children,
  url
}) => {
  return (
    <TableViewCell
      onClick={() => {
        openNew(url)
      }}
      iconPath={mdiOpenInNew}
    >
      {children}
    </TableViewCell>
  )
}

export default ExternalLinkTableViewCell
