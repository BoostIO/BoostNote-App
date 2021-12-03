import { mdiDrag, mdiFileDocumentOutline } from '@mdi/js'
import React, { useEffect } from 'react'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Icon from '../../../../design/components/atoms/Icon'
import NavigationItem from '../../../../design/components/molecules/Navigation/NavigationItem'
import MetadataContainer from '../../../../design/components/organisms/MetadataContainer'
import MetadataContainerRow from '../../../../design/components/organisms/MetadataContainer/molecules/MetadataContainerRow'
import { useModal } from '../../../../design/lib/stores/modal'
import styled from '../../../../design/lib/styled'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { SerializedTeam } from '../../../interfaces/db/team'
import { useRouter } from '../../../lib/router'
import { getDocTitle } from '../../../lib/utils/patterns'
import { getDocLinkHref } from '../../Link/DocLink'
import { Draggable } from '@fullcalendar/interaction'
import { useRef } from 'react'
import { useEffectOnce } from 'react-use'

interface CalendarNoDateContext {
  docs: SerializedDocWithSupplemental[]
  team: SerializedTeam
  currentUserIsCoreMember?: boolean
}

export const calendarDroppable = 'droppable-event-item'
const CalendarNoDateContext = ({
  docs,
  team,
  currentUserIsCoreMember,
}: CalendarNoDateContext) => {
  const { push } = useRouter()
  const { closeAllModals } = useModal()
  const menuRef = useRef<HTMLDivElement>(null)

  const onBlurHandler = (event: any) => {
    if (
      event.relatedTarget == null ||
      !menuRef.current!.contains(event.relatedTarget)
    ) {
      closeAllModals()
    }
  }

  useEffectOnce(() => {
    if (menuRef.current != null) {
      menuRef.current.focus()
    }
  })

  useEffect(() => {
    if (document.getElementById('fc-events') != null) {
      new Draggable(document.getElementById('fc-events')!, {
        itemSelector: `.droppable-event-item`,
        eventData: function (eventEl) {
          const data = JSON.parse(eventEl.getAttribute('data') || '{}')
          return {
            title: data.title,
            id: data.extendedProps.docId,
            display: 'none',
            extendedProps: {
              doc: data.extendedProps.doc,
            },
          }
        },
      })
    }
  }, [])

  return (
    <div id='fc-events' ref={menuRef} onBlur={onBlurHandler}>
      <Container>
        {docs.map((doc) => {
          const href = `${process.env.BOOST_HUB_BASE_URL}${getDocLinkHref(
            doc,
            team,
            'index'
          )}`
          const title = getDocTitle(doc, 'Untitled')
          return (
            <MetadataContainerRow
              key={doc.id}
              row={{
                type: 'content',
                content: (
                  <Flexbox
                    draggable={true}
                    className={'droppable-event-item'}
                    data={JSON.stringify({ title, extendedProps: { doc } })}
                  >
                    {currentUserIsCoreMember && (
                      <Icon path={mdiDrag} className='drag' />
                    )}
                    <NavigationItem
                      id={doc.id}
                      labelHref={href}
                      labelClick={() => {
                        push(href)
                        return closeAllModals()
                      }}
                      icon={
                        doc.emoji != null
                          ? { type: 'emoji', path: doc.emoji }
                          : {
                              type: 'icon',
                              path: mdiFileDocumentOutline,
                            }
                      }
                      label={title}
                    />
                  </Flexbox>
                ),
              }}
            />
          )
        })}
      </Container>
    </div>
  )
}

const Container = styled(MetadataContainer)`
  .metadata__content {
    width: 100%;
  }
  .drag {
    padding: 0 ${({ theme }) => theme.sizes.spaces.xsm}px;
    flex: 0 0 36px;
    display: block;
  }

  .navigation__item {
    overflow: hidden;
  }
`

export default CalendarNoDateContext
