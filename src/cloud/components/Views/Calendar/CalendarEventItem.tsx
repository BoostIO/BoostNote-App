import { EventContentArg } from '@fullcalendar/common'
import { EventApi } from '@fullcalendar/react'
import { mdiDotsHorizontal, mdiFileDocumentOutline } from '@mdi/js'
import { Emoji } from 'emoji-mart'
import React from 'react'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Icon from '../../../../design/components/atoms/Icon'
import NavigationItem from '../../../../design/components/molecules/Navigation/NavigationItem'
import styled from '../../../../design/lib/styled'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { getDocTitle } from '../../../lib/utils/patterns'
import {
  CalendarViewProp,
  isCalendarStaticProp,
} from '../../../lib/views/calendar'
import PropPicker from '../../Props/PropPicker'

type CalendarEventItemProps = {} & EventContentArg

type DocEventExtendedProps = EventApi & {
  extendedProps: {
    doc: SerializedDocWithSupplemental
    displayedProps: CalendarViewProp[]
    onContextClick: (event: React.MouseEvent) => void
    onClick?: () => void
  }
}

//CANT USE REACT HOOKS
const CalendarEventItem = ({ event }: CalendarEventItemProps) => {
  if (!isDocEvent(event)) {
    return null
  }

  const { doc, displayedProps, onContextClick, onClick } = event.extendedProps

  return (
    <Container className='event__item'>
      <NavigationItem
        className='event__item__nav'
        label={
          <Flexbox direction='column'>
            <Flexbox className='event__label__wrapper'>
              <div className='event__label__icon'>
                {doc.emoji != null ? (
                  <Emoji emoji={doc.emoji} set='apple' size={16} />
                ) : (
                  <Icon path={mdiFileDocumentOutline} size={16} />
                )}
              </div>
              <span className='event__label'>
                {getDocTitle(doc, 'Untitled')}
              </span>
            </Flexbox>
            {displayedProps.map((prop, i) => {
              const docProp = doc.props[prop.name]

              if (isCalendarStaticProp(prop)) {
                return
              }

              if (docProp == null || docProp.data == null) {
                return null
              }

              return (
                <div key={`event-${doc.id}-prop-${i}`} className='event__prop'>
                  <PropPicker
                    parent={{ type: 'doc', target: doc }}
                    propName={prop.name}
                    propData={docProp}
                    readOnly={true}
                    showIconPath={true}
                  />
                </div>
              )
            })}
          </Flexbox>
        }
        labelClick={onClick}
        controls={[
          {
            icon: mdiDotsHorizontal,
            onClick: onContextClick,
          },
        ]}
      />
    </Container>
  )
}

function isDocEvent(event: EventApi): event is DocEventExtendedProps {
  if (
    event.extendedProps.doc == null ||
    event.extendedProps.onContextClick == null
  ) {
    return false
  }

  return true
}

const Container = styled.div`
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  min-height: 25px;
  background: ${({ theme }) => theme.colors.background.tertiary};
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background.tertiary};

  .event__item__nav,
  .navigation__item__wrapper {
    width: 100%;
    height: min-content;
  }

  .navigation__item__label {
    min-height: 24px;
  }

  .navigation__item__label__ellipsis {
    flex: 1 1 auto;
    height: min-content;
    display: flex;
    overflow: hidden;
  }

  .event__label__wrapper,
  .event__prop {
    flex: 0 0 auto;
    width: 100%;
    overflow: hidden;
  }

  .event__label__icon {
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .event__label {
    display: block;
    ${overflowEllipsis()}
  }

  .item__property__button {
    pointer-events: none;
    padding-left: 0;
  }
`

export default CalendarEventItem
