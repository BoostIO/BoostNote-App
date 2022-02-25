import React from 'react'
import { mdiTrashCanOutline } from '@mdi/js'
import Button from '../../../../../design/components/atoms/Button'
import FormRow from '../../../../../design/components/molecules/Form/templates/FormRow'
import FormRowItem from '../../../../../design/components/molecules/Form/templates/FormRowItem'
import { TFunction } from 'i18next'
import { useI18n } from '../../../../lib/hooks/useI18n'
import { lngKeys } from '../../../../lib/i18n/types'
import { EditableCondition } from './interfaces'
import ConditionValueControl from './ConditionValueControl'
import Flexbox from '../../../../../design/components/atoms/Flexbox'
import {
  FormSelectGroupOption,
  FormSelectOption,
} from '../../../../../design/components/molecules/Form/atoms/FormSelect'
import Icon from '../../../../../design/components/atoms/Icon'
import {
  supportedCustomPropertyTypes,
  supportedStaticPropertyTypes,
} from '../../../../lib/smartViews'
import styled from '../../../../../design/lib/styled'

interface ConditionItemProps {
  teamId: string
  hideConditionRuleType: boolean
  condition: EditableCondition
  update: (newCondition: EditableCondition) => void
  remove: () => void
}

const ConditionItem = ({
  condition,
  hideConditionRuleType,
  teamId,
  update,
  remove,
}: ConditionItemProps) => {
  const { translate } = useI18n()

  return (
    <FormRow fullWidth={true}>
      <Flexbox alignItems='flex-start' flex='1 1 auto'>
        {hideConditionRuleType ? (
          <FormRowItem
            flex='0 1 100px'
            item={{ type: 'node', element: <span>Where</span> }}
          />
        ) : (
          <FormRowItem
            flex='0 1 100px'
            item={{
              type: 'select',
              props: {
                value: getRuleOptionByType(translate, condition.rule),
                options: [
                  getRuleOptionByType(translate, 'and'),
                  getRuleOptionByType(translate, 'or'),
                ],
                onChange: (selectedOption: { value: 'and' | 'or' }) => {
                  update({ ...condition, rule: selectedOption.value })
                },
              },
            }}
          />
        )}
        <FormRowItem
          flex='0 0 160px'
          item={{
            type: 'select',
            props: {
              placeholder: 'Select..',
              value: inferConditionPrimaryType(translate, condition),
              options: SUPPORTED_PRIMARY_OPTIONS,
              onChange: (selectedOption: { label: any; value: string }) => {
                update(
                  getDefaultConditionByType(
                    selectedOption.value.split('/')[0],
                    condition.rule,
                    selectedOption.value.split('/')[1] || undefined
                  )
                )
              },
            },
          }}
        />
        <ConditionValueControl
          condition={condition}
          update={update}
          teamId={teamId}
        />
      </Flexbox>
      <Flexbox flex='0 0 auto'>
        <FormRowItem>
          <Button
            variant='transparent'
            iconPath={mdiTrashCanOutline}
            onClick={remove}
          />
        </FormRowItem>
      </Flexbox>
    </FormRow>
  )
}

export default ConditionItem

function inferConditionPrimaryType(t: TFunction, condition: EditableCondition) {
  switch (condition.type) {
    case 'label':
      return {
        label: (
          <StyledOption
            icon={supportedCustomPropertyTypes['label'].icon}
            label={t(lngKeys.GeneralLabels)}
          />
        ),
        value: supportedCustomPropertyTypes['label'].value,
      }
    case 'creation_date':
      return { label: t(lngKeys.CreationDate), value: 'creation_date' }
    case 'update_date':
      return { label: t(lngKeys.UpdateDate), value: 'update_date' }
    case 'folder':
      return { label: t(lngKeys.FolderFilter), value: 'folder' }
    case 'prop':
      switch (condition.value.type) {
        case 'date':
          return {
            label: (
              <StyledOption
                icon={supportedCustomPropertyTypes['date'].icon}
                label={supportedCustomPropertyTypes['date'].label}
              />
            ),
            value: supportedCustomPropertyTypes['date'].value,
          }
        case 'user':
          return {
            label: (
              <StyledOption
                icon={supportedCustomPropertyTypes['person'].icon}
                label={supportedCustomPropertyTypes['person'].label}
              />
            ),
            value: supportedCustomPropertyTypes['person'].value,
          }
        case 'status':
          return {
            label: (
              <StyledOption
                icon={supportedCustomPropertyTypes['status'].icon}
                label={supportedCustomPropertyTypes['status'].label}
              />
            ),
            value: supportedCustomPropertyTypes['status'].value,
          }
        case 'number':
          switch (condition.value.subType) {
            case 'checkbox':
            case 'timeperiod':
              return {
                label: (
                  <StyledOption
                    icon={
                      supportedCustomPropertyTypes[condition.value.subType].icon
                    }
                    label={
                      supportedCustomPropertyTypes[condition.value.subType]
                        .label
                    }
                  />
                ),
                value:
                  supportedCustomPropertyTypes[condition.value.subType].value,
              }
            default:
              break
          }
        // unsupported
        default:
      }
    case 'null':
    default:
      return undefined
  }
}

function getDefaultConditionByType(
  type: string,
  rule: 'and' | 'or',
  subType?: string
): EditableCondition {
  switch (type) {
    case 'date': {
      return {
        rule,
        type: 'prop',
        value: {
          name: '',
          value: {
            type: 'relative',
            period: 0,
          },
          subType,
          type: 'date',
        },
      }
    }
    case 'user':
      return {
        rule,
        type: 'prop',
        value: {
          name: '',
          value: [],
          type: 'user',
          subType,
        },
      }
    case 'number':
      return {
        rule,
        type: 'prop',
        value: {
          name: '',
          value: 0,
          type: 'number',
          subType,
        },
      }
    case 'status':
      return {
        rule,
        type: 'prop',
        value: {
          name: '',
          value: -1,
          type: 'status',
          subType,
        },
      }
    case 'label':
      return {
        rule,
        type: 'label',
        value: [],
      }
    case 'creation_date':
    case 'update_date':
      return {
        rule,
        type,
        value: {
          type: 'relative',
          period: 0,
        },
      }
    case 'folder': {
      return {
        rule,
        type,
        value: '',
      }
    }
    case 'null':
    default:
      return {
        type: 'null',
        rule,
      }
  }
}

function getRuleOptionByType(_t: TFunction, value: 'and' | 'or') {
  switch (value) {
    case 'and':
      return { label: 'AND', value: 'and' }
    case 'or':
      return { label: 'OR', value: 'or' }
  }
}

const StyledOption = ({ label, icon }: { label: string; icon?: string }) => {
  return (
    <StyledSelectOption>
      {icon != null && <Icon path={icon} />}
      <span>{label}</span>
    </StyledSelectOption>
  )
}

const StyledSelectOption = styled.div`
  display: flex;
  align-items: center;

  span {
    padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

const SUPPORTED_PRIMARY_OPTIONS: (FormSelectOption | FormSelectGroupOption)[] =
  [
    {
      label: 'Custom Props',
      options: Object.values(supportedCustomPropertyTypes).map(
        (propertyType) => {
          return {
            label: (
              <StyledOption
                icon={propertyType.icon}
                label={propertyType.label}
              />
            ),
            value: propertyType.value,
          }
        }
      ),
    },
    {
      label: 'Static',
      options: Object.values(supportedStaticPropertyTypes).map(
        (propertyType) => {
          return {
            label: (
              <StyledOption
                icon={propertyType.icon}
                label={propertyType.label}
              />
            ),
            value: propertyType.value,
          }
        }
      ),
    },
  ]
