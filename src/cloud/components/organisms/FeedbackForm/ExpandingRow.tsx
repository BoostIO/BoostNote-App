import React, { useCallback } from 'react'
import styled from '../../../lib/styled'
import { generateSecret } from '../../../lib/utils/secret'
import { inputStyle } from '../../../lib/styled/styleFunctions'

interface ExpandingRowProps {
  label: string
  isChecked: boolean
  expandedLabel: string
  expandedValue?: string
  toggleCheckBoxValue: () => void
  onChangeExpandedValue: (val: string) => void
}

const ExpandingRow = ({
  label,
  isChecked,
  toggleCheckBoxValue,
  expandedValue = '',
  expandedLabel,
  onChangeExpandedValue,
}: ExpandingRowProps) => {
  const rowId = generateSecret()
  const onCheckboxChangeHandler = useCallback(() => {
    toggleCheckBoxValue()
  }, [toggleCheckBoxValue])

  const onTextAreaChangeHandler = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChangeExpandedValue(event.target.value)
    },
    [onChangeExpandedValue]
  )

  return (
    <StyledExpandingRow>
      <div className='flex'>
        <input
          id={`${rowId}-checkbox`}
          type='checkbox'
          checked={isChecked}
          onChange={onCheckboxChangeHandler}
        />
        <label htmlFor={`${rowId}-checkbox`}>{label}</label>
      </div>
      {isChecked && (
        <div className='expanded-field'>
          <label>{expandedLabel}</label>
          <textarea
            placeholder='Please give us your feedback...'
            value={expandedValue}
            onChange={onTextAreaChangeHandler}
          />
        </div>
      )}
    </StyledExpandingRow>
  )
}

const StyledExpandingRow = styled.div`
  font-size: ${({ theme }) => theme.fontSizes.large}px;
  margin-top: ${({ theme }) => theme.space.xsmall}px;
  margin-bottom: ${({ theme }) => theme.space.small}px;
  .flex {
    display: flex;
  }

  .expanded-field {
    margin-top: ${({ theme }) => theme.space.small}px;
    font-size: ${({ theme }) => theme.fontSizes.default}px;
    label {
      display: block;
      width: 100%;
    }

    textarea {
      display: block;
      ${inputStyle}
      border: 1px solid ${({ theme }) => theme.baseBorderColor};
      margin-top: ${({ theme }) => theme.space.xxsmall}px;
      border-radius: 3px;
      resize: none;
      width: 100%;
      height: 100px;
      padding: ${({ theme }) => theme.space.xsmall}px ${({ theme }) =>
  theme.space.small}px;
    }
  }
`

export default ExpandingRow
