import React from 'react'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Scroller from '../../../../design/components/atoms/Scroller'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { getFormattedBoosthubDateTime } from '../../../lib/date'
import { getInitialPropDataOfPropType } from '../../../lib/props'
import { isListViewStaticProp, ListViewProp } from '../../../lib/views/list'
import DocTagsList from '../../DocPage/DocTagsList'
import PropPicker from '../../Props/PropPicker'

interface ListDocPropertiesProps {
  doc: SerializedDocWithSupplemental
  props: ListViewProp[]
  team: SerializedTeam
  currentUserIsCoreMember: boolean
}

const ListDocProperties = ({
  props,
  doc,
  team,
  currentUserIsCoreMember,
}: ListDocPropertiesProps) => {
  return (
    <Container>
      <Flexbox className='list-view__doc__properties'>
        {props.map((prop) => {
          if (isListViewStaticProp(prop)) {
            switch (prop.prop) {
              case 'creation_date':
              case 'update_date':
                return (
                  <Flexbox
                    className='static__dates'
                    key={`${doc.id}-${prop.prop}`}
                  >
                    {getFormattedBoosthubDateTime(
                      doc[
                        prop.prop === 'creation_date'
                          ? 'createdAt'
                          : 'updatedAt'
                      ]
                    )}
                  </Flexbox>
                )
              case 'label':
              default:
                return (
                  <DocTagsList
                    doc={doc}
                    team={team}
                    readOnly={!currentUserIsCoreMember}
                    key={`${doc.id}-label`}
                    emptyLabel={'Labels'}
                  />
                )
            }
          } else {
            const propType = prop.subType || prop.type
            const propName = prop.name
            const propData =
              (doc.props || {})[propName] ||
              getInitialPropDataOfPropType(propType)

            const isPropDataAccurate =
              propData.type === prop.type &&
              (propData.subType || null === prop.subType || null)

            return (
              <PropPicker
                parent={{ type: 'doc', target: doc }}
                propName={propName}
                propData={propData}
                readOnly={!currentUserIsCoreMember || !isPropDataAccurate}
                isErrored={!isPropDataAccurate}
                showIcon={true}
                emptyLabel={propName}
                key={`${doc.id}-${prop.type}-${prop.name}`}
              />
            )
          }
          return null
        })}
      </Flexbox>
    </Container>
  )
}

const Container = styled(Scroller)`
  max-width: 100%;
  overflow: hidden;

  .doc__tags {
    flex-grow: 0;
    flex: 0 0 auto;
  }

  .list-view__doc__properties {
    white-space: nowrap;
  }

  .item__property__button {
    min-width: 50px;
  }

  .property--errored {
    justify-content: center;
  }

  .react-datepicker-popper {
    z-index: 2;
  }

  .navigation__item {
    height: 100%;
  }

  .static__dates {
    height: 100%;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .sorting-options__select .form__select__single-value {
    display: flex;
  }

  .list-view__doc__properties > * + * {
    margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
    min-width: min-content;
    width: auto;
  }

  .doc__tags__list__item,
  .doc__tags__wrapper {
    flex-wrap: nowrap;
  }

  .doc__tags__wrapper.doc__tags__wrapper--full > * {
    margin-bottom: 0;
  }
`
export default ListDocProperties
