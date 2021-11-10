import cc from 'classcat'
import React, { useMemo, useState } from 'react'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { SerializedPropData } from '../../interfaces/db/props'
import {
  getIconPathOfPropType,
  getInitialPropDataOfPropType,
  getLabelOfPropType,
  supportedPropTypes,
} from '../../lib/props'

interface PropSelectorModalProps {
  disallowedNames?: string[]
  addProp: (propName: string, propData: SerializedPropData) => void
}

const PropSelectorModal = ({
  disallowedNames = [],
  addProp,
}: PropSelectorModalProps) => {
  const [propName, setPropName] = useState('')
  const disallowedNamesSet = useMemo(() => new Set(disallowedNames), [
    disallowedNames,
  ])

  return (
    <MetadataContainer>
      <MetadataContainerRow row={{ type: 'header', content: 'NAME' }} />
      <MetadataContainerRow
        row={{
          type: 'content',
          content: (
            <FormInput
              className={cc([
                disallowedNamesSet.has(propName) && 'form__input__error',
              ])}
              value={propName}
              onChange={(ev) => setPropName(ev.target.value)}
            />
          ),
        }}
      />
      {supportedPropTypes.map((propType) => (
        <MetadataContainerRow
          key={propType}
          row={{
            type: 'button',
            props: {
              id: `prop-modal-${propType}`,
              label: getLabelOfPropType(propType),
              iconPath: getIconPathOfPropType(propType),
              onClick: () => {
                if (propName !== '' && !disallowedNamesSet.has(propName)) {
                  addProp(propName, getInitialPropDataOfPropType(propType))
                }
              },
            },
          }}
        />
      ))}
    </MetadataContainer>
  )
}

export default PropSelectorModal
