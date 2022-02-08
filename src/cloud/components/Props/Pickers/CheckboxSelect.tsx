import React, { useCallback } from 'react'
import styled from '../../../../design/lib/styled'
import PropertyValueButton from './PropertyValueButton'
import { mdiCheckboxBlankOutline, mdiCheckBoxOutline } from '@mdi/js'
import Icon, { IconSize } from '../../../../design/components/atoms/Icon'

interface CheckboxSelectProps {
  sending?: boolean
  value?: boolean
  iconSize?: IconSize
  disabled?: boolean
  isReadOnly: boolean
  showIcon?: boolean
  popupAlignment?: 'bottom-left' | 'top-left'
  onCheckboxToggle: () => void
}

const CheckboxSelect = ({
  iconSize = 16,
  value = false,
  sending,
  disabled,
  isReadOnly,
  showIcon,
  onCheckboxToggle,
}: CheckboxSelectProps) => {
  const onCheckboxChange = useCallback(() => {
    onCheckboxToggle()
  }, [onCheckboxToggle])

  return (
    <CheckboxContainer>
      <PropertyValueButton
        sending={sending}
        isReadOnly={isReadOnly}
        disabled={disabled}
        onClick={() => onCheckboxChange()}
        iconPath={showIcon ? mdiCheckBoxOutline : undefined}
      >
        <div className='checkbox-select__label'>
          <Icon
            size={iconSize}
            path={value == true ? mdiCheckBoxOutline : mdiCheckboxBlankOutline}
          />
        </div>
      </PropertyValueButton>
    </CheckboxContainer>
  )
}

export default CheckboxSelect

const CheckboxContainer = styled.div`
  .checkbox-select__label {
    border-radius: 4px;
    color: white;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
`
