import { EventContentArg } from '@fullcalendar/common'
import { EventApi } from '@fullcalendar/react'
import { mdiDotsHorizontal, mdiFileDocumentOutline } from '@mdi/js'
import React from 'react'
import NavigationItem from '../../../../design/components/molecules/Navigation/NavigationItem'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { getDocTitle } from '../../../lib/utils/patterns'
import { getDocLinkHref } from '../../Link/DocLink'

type CalendarEventItemProps = {} & EventContentArg

type DocEventExtendedProps = EventApi & {
  extendedProps: {
    doc: SerializedDocWithSupplemental
    team: SerializedTeam
    push: (href: string) => void
    onContextClick: (event: React.MouseEvent) => void
  }
}

//CANT USE REACT HOOKS
const CalendarEventItem = ({ event }: CalendarEventItemProps) => {
  if (!isDocEvent(event)) {
    return null
  }

  const docLink = getDocLinkHref(
    event.extendedProps.doc,
    event.extendedProps.team,
    'index'
  )

  return (
    <Container className='event__item'>
      <NavigationItem
        className='event__item__nav'
        labelHref={docLink}
        labelClick={() => event.extendedProps.push(docLink)}
        label={getDocTitle(event.extendedProps.doc, 'Untitled')}
        icon={
          event.extendedProps.doc.emoji != null
            ? { type: 'emoji', path: event.extendedProps.doc.emoji }
            : { type: 'icon', path: mdiFileDocumentOutline }
        }
        controls={[
          {
            icon: mdiDotsHorizontal,
            onClick: event.extendedProps.onContextClick,
          },
        ]}
      />
    </Container>
  )
}

function isDocEvent(event: EventApi): event is DocEventExtendedProps {
  if (
    event.extendedProps.doc == null ||
    event.extendedProps.team == null ||
    event.extendedProps.push == null ||
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

  .event__item__nav {
    width: 100%;
  }
`

export default CalendarEventItem
