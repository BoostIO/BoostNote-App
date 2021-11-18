import React, { useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import styled from '../../../design/lib/styled'
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
  const inputRef = useRef<HTMLInputElement>(null)
  const [propName, setPropName] = useState('')
  const disallowedNamesSet = useMemo(() => new Set(disallowedNames), [
    disallowedNames,
  ])

  useEffectOnce(() => {
    if (inputRef.current != null) {
      inputRef.current.focus()
    }
  })

  return (
    <StyledContainer>
      <MetadataContainerRow row={{ type: 'header', content: 'NAME' }} />
      <MetadataContainerRow
        row={{
          type: 'content',
          content: (
            <FormInput
              value={propName}
              onChange={(ev) => setPropName(ev.target.value)}
              ref={inputRef}
            />
          ),
        }}
      />
      {disallowedNamesSet.has(propName) && (
        <MetadataContainerRow
          row={{
            type: 'content',
            content: (
              <p className='warning__text'>
                A property names {propName} already exists on this Doc
              </p>
            ),
          }}
        />
      )}
      <MetadataContainerRow
        row={{ type: 'header', content: 'PROPERTY TYPE' }}
      />
      {supportedPropTypes.map(({ type: propType, subType }) => (
        <MetadataContainerRow
          key={propType}
          row={{
            type: 'button',
            props: {
              id: `prop-modal-${propType}`,
              label: getLabelOfPropType(subType || propType),
              iconPath: getIconPathOfPropType(subType || propType),
              disabled:
                propName.trim() === '' || disallowedNamesSet.has(propName),
              onClick: () => {
                if (propName !== '' && !disallowedNamesSet.has(propName)) {
                  addProp(
                    propName,
                    getInitialPropDataOfPropType(subType || propType)
                  )
                }
              },
            },
          }}
        />
      ))}
    </StyledContainer>
  )
}

const StyledContainer = styled(MetadataContainer)`
  & .warning__text {
    color: ${({ theme }) => theme.colors.variants.warning.base};
    line-height: 18px;
    margin: 0;
  }
`

export default PropSelectorModal
