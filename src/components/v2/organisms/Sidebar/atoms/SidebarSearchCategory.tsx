import React, { FocusEventHandler, useState } from 'react'
import { AppComponent } from '../../../../../lib/v2/types'
import FoldingWrapper, { FoldingProps } from '../../../atoms/FoldingWrapper'
import cc from 'classcat'
import Button from '../../../atoms/Button'
import { mdiChevronDown, mdiChevronRight } from '@mdi/js'

interface SidebarSearchCategoryProps {
  folded: boolean
  id: string
}

const SidebarSearchCategory: AppComponent<
  SidebarSearchCategoryProps & FoldingProps
> = ({ children, id, folded, className, toggle, fold, unfold }) => {
  const [focused, setFocused] = useState(false)
  const unfocusOnBlur: FocusEventHandler = () => {
    setFocused(false)
  }
  return (
    <FoldingWrapper fold={fold} unfold={unfold} focused={focused}>
      <Button
        className={cc(['sidebar__search__category', className])}
        id={id}
        onFocus={() => setFocused(true)}
        onBlur={unfocusOnBlur}
        onClick={() => toggle()}
        variant='icon'
        iconSize={16}
        iconPath={folded ? mdiChevronRight : mdiChevronDown}
        size='sm'
      >
        {children}
      </Button>
    </FoldingWrapper>
  )
}

export default SidebarSearchCategory
