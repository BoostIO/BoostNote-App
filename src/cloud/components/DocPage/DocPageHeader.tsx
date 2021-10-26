import React from 'react'
import styled from '../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../interfaces/db/doc'
import cc from 'classcat'
import { useCloudResourceModals } from '../../lib/hooks/useCloudResourceModals'
import Button from '../../../design/components/atoms/Button'
import Icon from '../../../design/components/atoms/Icon'
import {
  mdiChevronDown,
  mdiChevronRight,
  mdiCommentTextOutline,
  mdiPencil,
  mdiPlus,
  mdiTrashCanOutline,
} from '@mdi/js'
import { usePage } from '../../lib/stores/pageStore'
import { SerializedTeam } from '../../interfaces/db/team'
import { usePreferences } from '../../lib/stores/preferences'
import { overflowEllipsis } from '../../../design/lib/styled/styleFunctions'
import { getDocTitle } from '../../lib/utils/patterns'
import ViewerDisclaimer from '../ViewerDisclaimer'
import Flexbox from '../../../design/components/atoms/Flexbox'
import PropPicker from '../Props/PropPicker'
import { useProps } from '../../lib/hooks/props'
import { useModal } from '../../../design/lib/stores/modal'
import PropSelectorModal from '../Props/PropSelectorModal'
import MetadataContainerRow from '../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import MetadataContainer from '../../../design/components/organisms/MetadataContainer'

interface DocPageHeaderProps {
  docIsEditable?: boolean
  doc: SerializedDocWithSupplemental
  className?: string
  team: SerializedTeam
}

const DocPageHeader = ({
  doc,
  docIsEditable,
  className,
}: DocPageHeaderProps) => {
  const { openRenameDocForm } = useCloudResourceModals()
  const { currentUserIsCoreMember } = usePage()
  const { preferences, setPreferences } = usePreferences()
  const { openContextModal, closeAllModals } = useModal()
  const { props: docProperties, updateProp, removeProp } = useProps(doc.props, {
    type: 'doc',
    target: doc,
  })

  return (
    <Container className={cc(['doc__page__header', className])}>
      <div className='doc__page__padding'>
        <ViewerDisclaimer />
        {docIsEditable ? (
          <Button
            variant='transparent'
            className={cc([
              'doc__page__header__title',
              !currentUserIsCoreMember && 'doc__page__header__title--disabled',
            ])}
            disabled={!currentUserIsCoreMember}
            onClick={() => openRenameDocForm(doc)}
          >
            <span className='doc__page__header__label'>
              {getDocTitle(doc, 'Untitled')}
            </span>
            <Icon path={mdiPencil} className='doc__page__header__icon' />
          </Button>
        ) : (
          <div className={cc(['doc__page__header__title'])}>
            <span className='doc__page__header__label'>{doc.title}</span>
          </div>
        )}
        <div className='doc__page__header__wrapper'>
          <div className='doc__page__header__props'>
            <Flexbox alignItems='flex-start' flex='1 1 auto'>
              <Flexbox flex='0 0 auto'>
                {preferences.docPropertiesAreHidden ? (
                  <Button
                    id='properties-show'
                    variant='transparent'
                    iconPath={mdiChevronRight}
                    onClick={() =>
                      setPreferences({ docPropertiesAreHidden: false })
                    }
                  >
                    Show Properties
                  </Button>
                ) : (
                  <Button
                    id='properties-hide'
                    variant='icon'
                    iconPath={mdiChevronDown}
                    size='sm'
                    onClick={() =>
                      setPreferences({ docPropertiesAreHidden: true })
                    }
                  />
                )}
              </Flexbox>
              {!preferences.docPropertiesAreHidden && (
                <Flexbox
                  flex='1 1 auto'
                  direction='column'
                  alignItems='flex-start'
                  className='doc__page__header__properties'
                >
                  {docProperties.map((prop, i) => {
                    return (
                      <div
                        className='doc__page__header__property'
                        key={`prop-${i}`}
                      >
                        <Button
                          className='doc__page__header__property__label'
                          variant='transparent'
                          size='sm'
                          onClick={(event) => {
                            openContextModal(
                              event,
                              <MetadataContainer>
                                <MetadataContainerRow
                                  row={{
                                    type: 'button',
                                    props: {
                                      onClick: () => {
                                        removeProp(prop[1].name)
                                        closeAllModals()
                                      },
                                      label: 'Delete property',
                                      iconPath: mdiTrashCanOutline,
                                      id: 'delete-property',
                                    },
                                  }}
                                />
                              </MetadataContainer>,
                              {
                                width: 200,
                                alignment: 'bottom-left',
                                removePadding: true,
                              }
                            )
                          }}
                        >
                          {prop[0]}
                        </Button>
                        <div className='doc__page__header__property__picker'>
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
                    size='sm'
                    iconPath={mdiPlus}
                    className='doc__page__header__property'
                    onClick={(event) => {
                      openContextModal(
                        event,
                        <PropSelectorModal
                          addProp={(propName, propData) => {
                            updateProp(propName, propData)
                            closeAllModals()
                          }}
                          propsToIgnore={docProperties.map(
                            (prop) => prop[1].name
                          )}
                        />,
                        { width: 200, alignment: 'right', removePadding: true }
                      )
                    }}
                  >
                    Add a property
                  </Button>
                </Flexbox>
              )}
            </Flexbox>
          </div>
          <Button
            className='doc__page__header__comments'
            variant='icon'
            iconPath={mdiCommentTextOutline}
            active={preferences.docContextMode === 'comment'}
            onClick={() =>
              setPreferences(({ docContextMode }) => ({
                docContextMode:
                  docContextMode === 'comment' ? 'hidden' : 'comment',
              }))
            }
          />
        </div>
      </div>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;

  .doc__page__padding {
    margin: 0 ${({ theme }) => theme.sizes.spaces.md}px;
    width: auto;
    padding-top: ${({ theme }) => theme.sizes.spaces.df}px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  .doc__page__header__comments {
    flex: 0 0 auto;
  }

  .doc__page__header__wrapper {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-top: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc__page__header__title {
    font-size: ${({ theme }) => theme.sizes.fonts.xl}px;
    color: ${({ theme }) => theme.colors.text.primary};
    width: fit-content;
    width: 100%;
    justify-content: flex-start;

    .doc__page__header__icon {
      display: none;
      margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    }

    .button__label {
      max-width: 100%;
    }

    .doc__page__header__label {
      ${overflowEllipsis}
    }

    &:not(.doc__page__header__title--disabled) {
      .doc__page__header__icon {
        flex: 0 0 auto;
      }
      &:hover {
        .doc__page__header__icon {
          display: block;
        }
        color: ${({ theme }) => theme.colors.text.subtle};
      }
    }
  }

  .doc__page__header__props {
    display: flex;
    flex: 1 1 auto;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .doc__page__header__properties {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  #properties-hide {
    margin-top: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .doc__page__header__property {
    &:not(button) {
      padding-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    }
    &:not(div) {
      padding-left: 0;
    }
    flex: 1 1 auto;
    display: flex;
    align-items: center;
  }

  .doc__page__header__property__label {
    width: 100px;
    justify-content: flex-start;
    .button__label {
      color: ${({ theme }) => theme.colors.text.primary};
    }
    ${overflowEllipsis}
  }

  .doc__page__header__property__picker {
    flex: 0 0 auto;
    margin-left: ${({ theme }) => theme.sizes.spaces.df}px;
    .form__select__control {
      width: 90px !important;
    }
  }

  .doc__page__header__property + .doc__page__header__property {
    margin-top: 2px;
  }
`

export default React.memo(DocPageHeader)
