import React, { useMemo } from 'react'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { NullablePropData } from '../../interfaces/db/props'
import {
  getIconPathOfProp,
  getInitialPropDataOfProp,
  getLabelOfProp,
  supportedPropertyNames,
} from '../../lib/props'

interface PropSelectorModalProps {
  propsToIgnore?: string[]
  addProp: (propName: string, propData: NullablePropData) => void
}

const PropSelectorModal = ({
  propsToIgnore = [],
  addProp,
}: PropSelectorModalProps) => {
  const props = useMemo(() => {
    return supportedPropertyNames
      .filter((propName) => !propsToIgnore.includes(propName))
      .sort((a, b) => {
        if (a > b) {
          return 1
        } else {
          return -1
        }
      })
  }, [propsToIgnore])

  return (
    <MetadataContainer>
      {props.map((propName) => (
        <MetadataContainerRow
          key={propName}
          row={{
            type: 'button',
            props: {
              id: `prop-modal-${propName}`,
              label: getLabelOfProp(propName),
              iconPath: getIconPathOfProp(propName),
              onClick: () =>
                addProp(propName, getInitialPropDataOfProp(propName)),
            },
          }}
        />
      ))}
    </MetadataContainer>
  )
}

export default PropSelectorModal
