import React from 'react'
import { StyledContentManagerRow } from '../styled'
import cc from 'classcat'
import Checkbox from '../../../atoms/Checkbox'
import Flexbox from '../../../atoms/Flexbox'

interface ContentManagerRowProps {
  checked?: boolean
  onSelect: (val: boolean) => void
  className?: string
  itemLink: any
  rowActions?: React.ReactNode
}

const ContentManagerRow = ({
  className,
  checked,
  itemLink,
  rowActions,
  onSelect,
}: ContentManagerRowProps) => (
  <StyledContentManagerRow className={cc([className])}>
    <Checkbox checked={checked} onChange={onSelect} />
    <Flexbox
      flex={'1 1 auto'}
      style={{
        height: '100%',
      }}
      className='link'
    >
      {itemLink}
    </Flexbox>
    {rowActions}
  </StyledContentManagerRow>
)

export default ContentManagerRow
