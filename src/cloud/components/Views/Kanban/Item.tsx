import { mdiFileDocumentOutline } from '@mdi/js'
import { Emoji } from 'emoji-mart'
import React from 'react'
import Flexbox from '../../../../design/components/atoms/Flexbox'
import Icon from '../../../../design/components/atoms/Icon'
import NavigationItem from '../../../../design/components/molecules/Navigation/NavigationItem'
import styled from '../../../../design/lib/styled'
import { overflowEllipsis } from '../../../../design/lib/styled/styleFunctions'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { getDocTitle } from '../../../lib/utils/patterns'
import { isKanbanStaticProp, KanbanViewProp } from '../../../lib/views/kanban'
import PropPicker from '../../Props/PropPicker'
import EditableItemContainer from '../EditableItemContainer'

interface ItemProps {
  doc: SerializedDocWithSupplemental
  onClick?: (doc: SerializedDocWithSupplemental) => void
  displayedProps: Record<string, KanbanViewProp>
}

const Item = ({ doc, displayedProps, onClick }: ItemProps) => {
  return (
    <EditableItemContainer doc={doc}>
      <Container
        labelClick={() => onClick && onClick(doc)}
        label={
          <Flexbox direction='column'>
            <Flexbox className='kanban__label__wrapper'>
              <div className='kanban__label__icon'>
                {doc.emoji != null ? (
                  <Emoji emoji={doc.emoji} set='apple' size={16} />
                ) : (
                  <Icon path={mdiFileDocumentOutline} size={16} />
                )}
              </div>
              <span className='kanban__label'>
                {getDocTitle(doc, 'Untitled')}
              </span>
            </Flexbox>
            {Object.values(displayedProps).map((prop, i) => {
              const docProp = doc.props[prop.name]

              if (isKanbanStaticProp(prop)) {
                return
              }

              if (docProp == null || docProp.data == null) {
                return null
              }

              return (
                <div
                  key={`kanban-${doc.id}-prop-${i}`}
                  className='kanban__prop'
                >
                  <PropPicker
                    parent={{ type: 'doc', target: doc }}
                    propName={prop.name}
                    propData={docProp}
                    readOnly={true}
                    showIcon={true}
                  />
                </div>
              )
            })}
          </Flexbox>
        }
      />
    </EditableItemContainer>
  )
}

const Container = styled(NavigationItem)`
  background-color: ${({ theme }) =>
    theme.colors.background.secondary} !important;
  cursor: grab;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  min-height: 25px;
  width: 100%;
  display: flex;
  flex-direction: column;

  &:focus,
  &.navigation__item--focused {
    background-color: ${({ theme }) =>
      theme.colors.background.secondary} !important;
  }

  .kanban__item__nav,
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

  .kanban__label__wrapper,
  .kanban__prop {
    flex: 0 0 auto;
    width: 100%;
    overflow: hidden;
  }

  .kanban__label__icon {
    flex: 0 0 auto;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .kanban__label {
    display: block;
    ${overflowEllipsis()}
  }

  .item__property__button {
    pointer-events: none;
    padding-left: 0;
  }
`

export default Item
