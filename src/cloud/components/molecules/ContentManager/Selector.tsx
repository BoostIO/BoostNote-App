import React, { useState } from 'react'
import {
  StyledContentManagerSelector,
  StyledContentManagerSelectorControl,
} from './styled'
import IconMdi from '../../atoms/IconMdi'
import { mdiChevronDown } from '@mdi/js'
import Flexbox from '../../atoms/Flexbox'
import Checkbox from '../../atoms/Checkbox'
import SelectorContextMenu from './SelectorContextMenu'

export type SeletorAction = {
  label: string
  onClick?: () => void
  disabled?: boolean
}

interface SelectorProps {
  checked?: boolean
  disabled?: boolean
  className?: string
  onChange: (val: boolean) => void
  actions: { label: string; onClick?: () => void; disabled?: boolean }[]
}

const Selector = ({
  checked = false,
  disabled,
  className,
  onChange,
  actions,
}: SelectorProps) => {
  const [opened, setOpened] = useState<boolean>(false)
  return (
    <Flexbox flex='0 0 auto' style={{ position: 'relative' }}>
      <Checkbox
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        className={className}
      />
      <StyledContentManagerSelectorControl>
        <StyledContentManagerSelector
          disabled={disabled}
          onClick={() => setOpened(true)}
        >
          <IconMdi path={mdiChevronDown} size={20} />
        </StyledContentManagerSelector>
        {opened && (
          <SelectorContextMenu
            actions={actions}
            closeContextMenu={() => setOpened(false)}
          />
        )}
      </StyledContentManagerSelectorControl>
    </Flexbox>
  )
}

export default Selector
