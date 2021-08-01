import { mdiFilterMenuOutline } from '@mdi/js'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Button from '../../../../shared/components/atoms/Button'
import { isChildNode } from '../../../../shared/lib/dom'
import styled from '../../../../shared/lib/styled'
import { DocStatus } from '../../../interfaces/db/doc'
import { usePreferences } from '../../../lib/stores/preferences'
import Checkbox from '../../atoms/Checkbox'
import DocStatusIcon from '../../atoms/DocStatusIcon'

interface ContentManagerStatusFilterProps {
  statusFilterSet: Set<DocStatus>
  setStatusFilterSet: React.Dispatch<React.SetStateAction<Set<DocStatus>>>
}

const ContentManagerStatusFilter = ({
  statusFilterSet,
  setStatusFilterSet,
}: ContentManagerStatusFilterProps) => {
  const { setPreferences } = usePreferences()
  const [
    showingStatusFilterContextMenu,
    setShowingStatusFilterContextMenu,
  ] = useState(false)

  const filterMenuRef = useRef<HTMLDivElement>(null)

  const handleStatusFilterContextMenuBlur = useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      if (!isChildNode(event.target, event.relatedTarget as Node)) {
        setShowingStatusFilterContextMenu(false)
      }
    },
    []
  )

  const toggleStatusFilter = useCallback(
    (status: DocStatus) => {
      setStatusFilterSet((previousSet) => {
        const newSet = new Set(previousSet)
        if (newSet.has(status)) {
          newSet.delete(status)
        } else {
          newSet.add(status)
        }
        setPreferences({ docStatusDisplayed: [...newSet.values()] })
        return newSet
      })
    },
    [setStatusFilterSet, setPreferences]
  )

  useEffect(() => {
    if (filterMenuRef.current == null) {
      return
    }
    if (!showingStatusFilterContextMenu) {
      return
    }
    filterMenuRef.current.focus()
  }, [showingStatusFilterContextMenu])

  return (
    <Container>
      <Button
        variant='transparent'
        className='header__control__button'
        iconPath={mdiFilterMenuOutline}
        iconSize={16}
        onClick={() => setShowingStatusFilterContextMenu(true)}
      />
      {showingStatusFilterContextMenu && (
        <div
          className='cm__filter-menu'
          ref={filterMenuRef}
          onBlur={handleStatusFilterContextMenuBlur}
          tabIndex={-1}
        >
          <div className='cm__filter-menu__menu-item'>
            <Checkbox
              className='cm__filter-menu__menu-item__checkbox'
              checked={statusFilterSet.has('in_progress')}
              onChange={() => toggleStatusFilter('in_progress')}
              label={
                <div className='cm__filter-menu__menu-item__checkbox__label'>
                  <DocStatusIcon
                    className='cm__filter-menu__menu-item__checkbox__label__icon'
                    size={16}
                    status='in_progress'
                  />
                  <div className='cm__filter-menu__menu-item__checkbox__label__text'>
                    In Progress
                  </div>
                </div>
              }
            />
          </div>
          <div className='cm__filter-menu__menu-item'>
            <Checkbox
              className='cm__filter-menu__menu-item__checkbox'
              checked={statusFilterSet.has('paused')}
              onChange={() => toggleStatusFilter('paused')}
              label={
                <div className='cm__filter-menu__menu-item__checkbox__label'>
                  <DocStatusIcon
                    className='cm__filter-menu__menu-item__checkbox__label__icon'
                    size={16}
                    status='paused'
                  />
                  <div className='cm__filter-menu__menu-item__checkbox__label__text'>
                    Paused
                  </div>
                </div>
              }
            />
          </div>
          <div className='cm__filter-menu__menu-item'>
            <Checkbox
              className='cm__filter-menu__menu-item__checkbox'
              checked={statusFilterSet.has('completed')}
              onChange={() => toggleStatusFilter('completed')}
              label={
                <div className='cm__filter-menu__menu-item__checkbox__label'>
                  <DocStatusIcon
                    className='cm__filter-menu__menu-item__checkbox__label__icon'
                    size={16}
                    status='completed'
                  />
                  <div className='cm__filter-menu__menu-item__checkbox__label__text'>
                    Completed
                  </div>
                </div>
              }
            />
          </div>
          <div className='cm__filter-menu__menu-item'>
            <Checkbox
              className='cm__filter-menu__menu-item__checkbox'
              checked={statusFilterSet.has('archived')}
              onChange={() => toggleStatusFilter('archived')}
              label={
                <div className='cm__filter-menu__menu-item__checkbox__label'>
                  <DocStatusIcon
                    className='cm__filter-menu__menu-item__checkbox__label__icon'
                    size={16}
                    status='archived'
                  />
                  <div className='cm__filter-menu__menu-item__checkbox__label__text'>
                    Archived
                  </div>
                </div>
              }
            />
          </div>
        </div>
      )}
    </Container>
  )
}

const Container = styled.div`
  position: relative;

  .cm__filter-menu {
    top: 28px;
    right: 4px;
    width: 140px;
    z-index: 1;
    position: absolute;
    background-color: ${({ theme }) => theme.colors.background.primary};
    border: solid 1px ${({ theme }) => theme.colors.border.main};
  }

  .cm__filter-menu__menu-item {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 0 4px;
  }
  .cm__filter-menu__menu-item__checkbox {
    height: 100%;
    width: 100%;
  }
  .cm__filter-menu__menu-item__checkbox__label {
    display: flex;
    align-items: center;
  }
  .cm__filter-menu__menu-item__checkbox__label__icon {
    margin-right: 4px;
  }
`

export default ContentManagerStatusFilter
