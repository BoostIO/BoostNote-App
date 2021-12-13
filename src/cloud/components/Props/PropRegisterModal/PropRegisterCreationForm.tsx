import React, { useMemo, useState } from 'react'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'
import Icon from '../../../../design/components/atoms/Icon'
import Form from '../../../../design/components/molecules/Form'
import { FormSelectOption } from '../../../../design/components/molecules/Form/atoms/FormSelect'
import FormRow from '../../../../design/components/molecules/Form/templates/FormRow'
import styled from '../../../../design/lib/styled'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'
import { PropSubType, PropType } from '../../../interfaces/db/props'
import {
  getIconPathOfPropType,
  getLabelOfPropType,
  supportedPropTypes,
} from '../../../lib/props'

export interface PropRegisterCreationFormProps {
  defaultName?: string
  disabled?: boolean
  isNameValid?: (name: string) => boolean
  onPropCreate: (props: {
    name: string
    type: PropType
    subType?: PropSubType
  }) => void
}

const PropRegisterCreationForm = ({
  defaultName = '',
  disabled,
  isNameValid,
  onPropCreate,
}: PropRegisterCreationFormProps) => {
  const [propName, setPropName] = useState(defaultName)
  const [propType, setPropType] = useState<typeof supportedPropTypes[number]>()

  const typeOptions: FormSelectOption[] = useMemo(() => {
    return supportedPropTypes.map(getValueFromSupportedType)
  }, [])

  const propNameIsValid = isNameValid != null ? isNameValid(propName) : true
  return (
    <Form
      submitButton={{
        label: 'Create',
        disabled: propName === '' || !propNameIsValid || disabled,
        variant: 'primary',
      }}
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()

        if (propType == null) {
          return
        }
        return onPropCreate({
          name: propName,
          type: propType.type,
          subType:
            typeof propType.subType === 'string' ? propType.subType : undefined,
        })
      }}
    >
      <FormRow
        fullWidth={true}
        row={{
          title: 'Name',
          items: [
            {
              type: 'input',
              props: {
                disabled,
                id: 'prop__register__name',
                value: propName,
                onChange: (e) => setPropName(e.target.value),
                placeholder: '...',
              },
            },
          ],
        }}
      />
      <FormRow
        fullWidth={true}
        row={{
          title: 'Type',
          items: [
            {
              type: 'select',
              props: {
                isDisabled: disabled,
                id: 'prop__register__type',
                placeholder: 'Select...',
                value:
                  propType != null
                    ? getValueFromSupportedType(propType)
                    : undefined,
                options: typeOptions,
                onChange: ({ value }) => {
                  const splitId = value.split('/')
                  setPropType({
                    type: splitId[0],
                    subType: splitId.length > 1 ? splitId[1] : undefined,
                  })
                },
              },
            },
          ],
        }}
      />
      {!propNameIsValid && propName.trim() !== '' && (
        <FormRow>
          <ColoredBlock variant='warning'>
            A property named &apos;{propName}&apos; already exists.
          </ColoredBlock>
        </FormRow>
      )}
    </Form>
  )
}

function getValueFromSupportedType(val: typeof supportedPropTypes[number]) {
  const icon = getIconPathOfPropType(val.subType || val.type)
  return {
    label: (
      <PropOption>
        {icon != null && (
          <Icon path={icon} className='proptype__option__icon' />
        )}
        <span className='proptype__option__label'>
          {getLabelOfPropType(val.subType || val.type)}
        </span>
      </PropOption>
    ),
    value: val.subType != null ? [val.type, val.subType].join('/') : val.type,
  }
}

const PropOption = styled.div`
  display: flex;
  align-items: center;
  overflow: hidden;

  .proptype__option__icon {
    flex: 0 0 auto;
  }

  .proptype__option__label {
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    ${overflowEllipsis}
  }
`

export default PropRegisterCreationForm
