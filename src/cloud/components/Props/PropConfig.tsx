import { mdiTrashCanOutline } from '@mdi/js'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEffectOnce } from 'react-use'
import FormInput from '../../../design/components/molecules/Form/atoms/FormInput'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useModal } from '../../../design/lib/stores/modal'
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
      (prop.data.type !== newProp.data.type && shouldModify.current)
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
    <MetadataContainer>
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
          type: 'button',
          props: {
            label: getLabelOfPropType(newProp.data.type),
            iconPath: getIconPathOfPropType(newProp.data.type),
            onClick: (event) => {
              openContextModal(
                event,
                <MetadataContainer>
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
                            setNewProp((prev) => {
                              return prev.data.type === propType
                                ? prev
                                : {
                                    ...prev,
                                    data: getInitialPropDataOfPropType(
                                      propType
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
            },
          },
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
            label: 'Delete property',
            iconPath: mdiTrashCanOutline,
            id: 'delete-property',
          },
        }}
      />
    </MetadataContainer>
  )
}

export default PropConfig
