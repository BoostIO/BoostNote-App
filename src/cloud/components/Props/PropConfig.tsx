import { mdiChevronRight, mdiTrashCanOutline } from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import Button from '../../../design/components/atoms/Button'
import Icon from '../../../design/components/atoms/Icon'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useModal } from '../../../design/lib/stores/modal'
import styled from '../../../design/lib/styled'
import { SerializedPropData } from '../../interfaces/db/props'
import {
  getIconPathOfPropType,
  getInitialPropDataOfPropType,
  getLabelOfPropType,
  supportedPropTypes,
} from '../../lib/props'

type NamedProp = { name: string; data: SerializedPropData }

interface PropConfigProps {
  prop: NamedProp
  onDelete: (prop: NamedProp) => void
  onUpdate: (original: NamedProp, updated: NamedProp) => void
  disallowedNames?: string[]
}

const PropConfig = ({
  prop,
  onDelete,
  onUpdate,
  disallowedNames,
}: PropConfigProps) => {
  const { openContextModal, closeLastModal } = useModal()
  const [newProp, setNewProp] = useState(prop)
  const disallowedNamesSet = useMemo(() => new Set(disallowedNames || []), [
    disallowedNames,
  ])
  const shouldModify = useRef(true)

  const closeCallback = useCallback(() => {
    if (
      prop.name != newProp.name ||
      ((prop.data.type !== newProp.data.type ||
        prop.data.subType !== newProp.data.subType) &&
        shouldModify.current)
    ) {
      onUpdate(prop, newProp)
    }
  }, [prop, newProp, onUpdate])

  const closeCallbackRef = useRef(closeCallback)
  useEffect(() => {
    closeCallbackRef.current = closeCallback
  }, [closeCallback])

  useEffectOnce(() => {
    return () => {
      closeCallbackRef.current()
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
              value={newProp.name}
              onChange={(ev) => {
                const newName = ev.target.value
                setNewProp((prev) => {
                  return {
                    name: newName,
                    data: prev.data,
                  }
                })
              }}
            />
          ),
        }}
      />
      {disallowedNamesSet.has(newProp.name) && (
        <MetadataContainerRow
          row={{
            type: 'content',
            content: (
              <p className='warning__text'>
                A property names {newProp.name} already exists on this Doc
              </p>
            ),
          }}
        />
      )}
      <MetadataContainerRow
        row={{ type: 'header', content: 'PROPERTY TYPE' }}
      />
      <MetadataContainerRow
        row={{
          type: 'content',
          content: (
            <Button
              variant='transparent'
              className='metadata__button prop__config__submenu__button'
              iconPath={getIconPathOfPropType(
                newProp.data.subType || newProp.data.type
              )}
              iconSize={16}
              onClick={(event) => {
                openContextModal(
                  event,
                  <MetadataContainer>
                    {supportedPropTypes.map(({ type: propType, subType }) => (
                      <MetadataContainerRow
                        key={propType}
                        row={{
                          type: 'button',
                          props: {
                            disabled: propType === 'string',
                            id: `prop-modal-${propType}`,
                            label: getLabelOfPropType(subType || propType),
                            iconPath: getIconPathOfPropType(
                              subType || propType
                            ),
                            onClick: () => {
                              setNewProp((prev) => {
                                return prev.data.type === propType &&
                                  prev.data.subType === subType
                                  ? prev
                                  : {
                                      name: prev.name,
                                      data: getInitialPropDataOfPropType(
                                        subType || propType
                                      ),
                                    }
                              })
                              closeLastModal()
                            },
                          },
                        }}
                      />
                    ))}
                  </MetadataContainer>,
                  {
                    alignment: 'right',
                    keepAll: true,
                    width: 200,
                    removePadding: true,
                  }
                )
              }}
            >
              <span>
                {getLabelOfPropType(newProp.data.subType || newProp.data.type)}
              </span>
              <Icon path={mdiChevronRight} size={16} />
            </Button>
          ),
        }}
      />
      <MetadataContainerRow
        row={{
          type: 'button',
          props: {
            onClick: () => {
              shouldModify.current = false
              onDelete(prop)
            },
            label: 'Delete',
            iconPath: mdiTrashCanOutline,
            id: 'delete-property',
          },
        }}
      />
    </StyledContainer>
  )
}

export default PropConfig

const StyledContainer = styled(MetadataContainer)`
  & .prop__config__submenu__button {
    & .button__label {
      flex-grow: 1;
      & span {
        flex-grow: 1;
      }
    }
  }

  & .warning__text {
    color: ${({ theme }) => theme.colors.variants.warning.base};
    line-height: 18px;
    margin: 0;
  }
`
