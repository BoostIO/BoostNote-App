import { mdiLabelOutline, mdiChevronDown, mdiChevronUp, mdiPlus } from '@mdi/js'
import React, { useMemo } from 'react'
import Button from '../../design/components/atoms/Button'
import Flexbox from '../../design/components/atoms/Flexbox'
import { useModal } from '../../design/lib/stores/modal'
import { SerializedDocWithSupplemental } from '../interfaces/db/doc'
import { SerializedTeam } from '../interfaces/db/team'
import { useProps } from '../lib/hooks/props'
import { getIconPathOfPropType } from '../lib/props'
import { usePreferences } from '../lib/stores/preferences'
import DocTagsList from './DocPage/DocTagsList'
import DocPagePropsAddContext from './Props/DocPagePropsAddContext'
import PropConfig from './Props/PropConfig'
import PropPicker from './Props/PropPicker'
import cc from 'classcat'
import styled from '../../design/lib/styled'
import { overflowEllipsis } from '../../design/lib/styled/styleFunctions'

interface DocPropertiesProps {
  doc: SerializedDocWithSupplemental
  team: SerializedTeam
  currentUserIsCoreMember: boolean
  className?: string
}

const DocProperties = ({
  doc,
  team,
  currentUserIsCoreMember,
  className,
}: DocPropertiesProps) => {
  const { preferences, setPreferences } = usePreferences()
  const { openContextModal, closeLastModal } = useModal()
  const { props: docProperties, updateProp, modifyProp, removeProp } = useProps(
    doc.props || {},
    {
      type: 'doc',
      target: doc,
    }
  )

  const existingPropNames = useMemo(() => {
    return docProperties.map((prop) => prop[1].name)
  }, [docProperties])

  return (
    <Container className={cc([className])}>
      <Flexbox alignItems='flex-start' flex='1 1 auto'>
        {preferences.docPropertiesAreHidden ? (
          <Flexbox flex='0 0 auto'>
            <Button
              id='properties-show'
              variant='transparent'
              size='sm'
              iconPath={mdiChevronDown}
              onClick={() => setPreferences({ docPropertiesAreHidden: false })}
            >
              Show Properties
            </Button>
          </Flexbox>
        ) : (
          <Flexbox
            flex='1 1 auto'
            direction='column'
            alignItems='flex-start'
            className='doc-props__properties'
          >
            <div className='doc-props__property'>
              <Button
                className='doc-props__property__label'
                variant='transparent'
                size='sm'
                iconPath={mdiLabelOutline}
              >
                Labels
              </Button>
              <div className='doc-props__property__picker'>
                <DocTagsList
                  team={team}
                  doc={doc}
                  readOnly={!currentUserIsCoreMember}
                />
              </div>
            </div>
            {docProperties.map((prop, i) => {
              const iconPath = getIconPathOfPropType(
                prop[1].data.type === 'json' &&
                  prop[1].data.data != null &&
                  prop[1].data.data.dataType != null
                  ? prop[1].data.data.dataType
                  : prop[1].data.type
              )
              return (
                <div className='doc-props__property' key={`prop-${i}`}>
                  <Button
                    className='doc-props__property__label'
                    variant='transparent'
                    size='sm'
                    iconPath={iconPath}
                    onClick={(event) => {
                      openContextModal(
                        event,
                        <PropConfig
                          disallowedNames={existingPropNames.filter(
                            (name) => name != prop[1].name
                          )}
                          prop={prop[1]}
                          onUpdate={(prop, updated) => {
                            if (
                              prop.name !== updated.name ||
                              prop.data.type !== updated.data.type
                            ) {
                              modifyProp(prop.name, updated.name, updated.data)
                            }
                          }}
                          onDelete={({ name }) => {
                            removeProp(name)
                            closeLastModal()
                          }}
                        />,
                        {
                          width: 200,
                          alignment: 'bottom-left',
                          removePadding: true,
                          keepAll: true,
                        }
                      )
                    }}
                  >
                    {prop[0]}
                  </Button>
                  <div className='doc-props__property__picker'>
                    <PropPicker
                      parent={{ type: 'doc', target: doc }}
                      propName={prop[1].name}
                      propData={prop[1].data}
                      readOnly={!currentUserIsCoreMember}
                    />
                  </div>
                </div>
              )
            })}
            <Button
              variant='transparent'
              iconPath={mdiPlus}
              className='doc-props__property'
              size='sm'
              onClick={(event) => {
                openContextModal(
                  event,
                  <DocPagePropsAddContext
                    doc={doc}
                    disallowedNames={existingPropNames}
                    addProp={(propName, propData) => {
                      updateProp(propName, propData)
                      closeLastModal()
                    }}
                  />,
                  {
                    width: 200,
                    alignment: 'right',
                    removePadding: true,
                    keepAll: true,
                  }
                )
              }}
            >
              Add a property
            </Button>
            <Button
              id='properties-hide'
              variant='transparent'
              size='sm'
              className='doc-props__property'
              iconPath={mdiChevronUp}
              onClick={() => setPreferences({ docPropertiesAreHidden: true })}
            >
              Hide Properties
            </Button>
          </Flexbox>
        )}
      </Flexbox>
    </Container>
  )
}

const Container = styled.div`
  #properties-hide {
    margin-left: 0;
  }

  .doc-props__property {
    &:not(button) {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
    flex: 1 1 auto;
    display: flex;
    align-items: center;
  }

  span.doc-props__property__label {
    padding: 0 8px;

    max-width: 600px;
    ${overflowEllipsis};
  }

  .doc-props__property__label {
    width: 100px;
    justify-content: flex-start;
    .button__label {
      color: ${({ theme }) => theme.colors.text.primary};
    }
    ${overflowEllipsis}
  }

  .doc-props__property__picker {
    flex: 0 0 auto;
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
    .form__select__control {
      width: 90px !important;
    }
    max-width: 600px;
    ${overflowEllipsis};
  }

  .icon.doc__tags__icon {
    display: none;
  }

  .doc-props__property + .doc-props__property {
    margin-top: 2px;
  }

  div.doc-props__property {
    width: 100%;
    .doc__tags {
      height: auto;
    }
    .doc-props__property__label {
      flex-grow: 0;
      min-width: 130px;
    }
    .doc-props__property__picker {
      flex-grow: 1;

      .item__property__button {
        width: 100%;
      }

      .item__due-date__select,
      .item__due-date__select > div.react-datepicker-wrapper {
        width: 100%;
      }

      .item__due-date__select .react-datepicker__triangle {
        left: 30px !important;
      }
    }
  }
`

export default DocProperties
