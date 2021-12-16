import React from 'react'
import cc from 'classcat'
import styled from '../../../../design/lib/styled'
import { AppComponent } from '../../../../design/lib/types'
import Checkbox from '../../../../design/components/molecules/Form/atoms/FormCheckbox'

interface ViewManagerContentRowProps {
  checked?: boolean
  onSelect: (val: boolean) => void
  label: string | React.ReactNode
  showCheckbox: boolean
  className?: string
}

const ListViewHeader: AppComponent<ViewManagerContentRowProps> = ({
  className,
  children,
  checked,
  label,
  showCheckbox,
  onSelect,
}) => {
  return (
    <StyledContentManagerRow className={cc(['cm__row', className])}>
      {showCheckbox && (
        <Checkbox
          className={cc(['row__checkbox', checked && 'row__checkbox--checked'])}
          checked={checked}
          toggle={() => onSelect(!checked)}
        />
      )}
      <div draggable={true} className='cm__row__label'>
        <span className='cm__row__label--line'>{label}</span>
      </div>
      {children != null && <div className='cm__row__content'>{children}</div>}
    </StyledContentManagerRow>
  )
}

export default ListViewHeader

const rowHeight = 40
const StyledContentManagerRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  min-height: ${rowHeight}px;
  flex: 1 1 auto;
  flex-shrink: 0;
  width: 100%;
  font-size: 13px;
  padding: 0 ${({ theme }) => theme.sizes.spaces.df}px;

  .cm__row__label {
    color: ${({ theme }) => theme.colors.text.subtle};
    border-bottom-color: transparent;
  }

  &:hover {
    .custom-check::before {
      border-color: ${({ theme }) => theme.colors.text.secondary};
    }

    .row__checkbox {
      opacity: 1;
    }
  }

  .cm__row__emoji {
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }
  .emoji-icon {
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .cm__row__label {
    width: 100%;
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.secondary};
    text-decoration: none;
    min-height: ${rowHeight}px;
  }

  .row__checkbox {
    opacity: 0;
    margin-right: ${({ theme }) => theme.sizes.spaces.df}px;

    &.row__checkbox--checked {
      opacity: 1;
    }
  }

  &.content__manager__row--draggedOver {
    background: ${({ theme }) => theme.colors.background.quaternary};
  }
`
