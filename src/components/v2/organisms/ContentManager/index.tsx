import React, { useMemo, useState } from 'react'
import styled from '../../../../shared/lib/styled'
import cc from 'classcat'
import ContentManagerSort, {
  contentManagerSortOptions,
} from './molecules/ContentManagerSort'
import Button from '../../../../shared/components/atoms/Button'
import { useSet } from 'react-use'
import ContentManagerRow from './atoms/ContentManagerRow'
import { ContentManagerItemProps } from '../../../../shared/lib/mappers/types'
import Checkbox from '../../../../shared/components/molecules/Form/atoms/FormCheckbox'
import {
  sortByAttributeAsc,
  sortByAttributeDesc,
} from '../../../../shared/lib/utils/array'
import { AppUser } from '../../../../shared/lib/mappers/users'

interface ContentManagerProps<T> {
  className?: string
  push: (href: string) => void
  items: ContentManagerItemProps<T>[]
  users?: Map<string, AppUser>
  categories: T[]
}

const idBreak = '-'

const ContentManager = <T extends string>({
  className,
  categories,
  items,
  users = new Map(),
  push,
}: ContentManagerProps<T>) => {
  const [order, setOrder] = useState<
    typeof contentManagerSortOptions[number]['value']
  >('Latest Updated')
  const [activeCategory, setActiveCategory] = useState<T | 'all'>('all')
  const [
    selectedRows,
    { add: addRow, has: hasRow, toggle: toggleRow, remove: removeRow },
  ] = useSet<string>(new Set())

  const filteredItems = useMemo(() => {
    return items.reduce((acc, val) => {
      acc.set(val.category, [...(acc.get(val.category) || []), val])
      return acc
    }, new Map() as Map<T, ContentManagerItemProps<T>[]>)
  }, [items])

  const displayedItems =
    activeCategory === 'all' ? items : filteredItems.get(activeCategory) || []
  const displayedItemsAreAllSelected = displayedItems.reduce((acc, val) => {
    return acc && hasRow(`${val.category}${idBreak}${val.id}`)
  }, true)
  return (
    <Container
      className={cc([
        'content__manager',
        selectedRows.size > 0 && 'content__manager--active',
        className,
      ])}
    >
      <div className='content__manager__header'>
        <div className='content__manager__header__left'>
          <Checkbox
            className='content__manager__checkbox'
            checked={displayedItemsAreAllSelected}
            toggle={() => {
              if (displayedItemsAreAllSelected) {
                displayedItems.forEach((item) =>
                  removeRow(`${item.category}${idBreak}${item.id}`)
                )
              } else {
                displayedItems.forEach((item) =>
                  addRow(`${item.category}${idBreak}${item.id}`)
                )
              }
            }}
          />
          {selectedRows.size === 0 && (
            <>
              <Button
                variant='transparent'
                className='content__manager__category'
                active={activeCategory === 'all'}
                onClick={() => setActiveCategory('all')}
              >
                All
              </Button>
              {categories.map((category) => {
                if (!filteredItems.has(category)) {
                  return null
                }

                return (
                  <Button
                    variant='transparent'
                    className='content__manager__category'
                    active={activeCategory === category}
                    onClick={() => setActiveCategory(category)}
                    key={category}
                  >
                    {category}
                  </Button>
                )
              })}
            </>
          )}
        </div>
        <ContentManagerSort
          value={order}
          onChange={(val) => setOrder(val.value)}
          className='content__manager__header__right'
        />
      </div>
      <div className='content__manager__content'>
        {(activeCategory === 'all' ? categories : [activeCategory]).map(
          (category) => {
            const children = getSortedItems(
              order,
              filteredItems.get(category) || []
            )
            const selectedChildren = children.filter((child) =>
              hasRow(`${category}${idBreak}${child.id}`)
            )

            if (children.length === 0) {
              return null
            }

            return (
              <React.Fragment key={`manager__${category}`}>
                <div className='content__manager__category__row'>
                  <Checkbox
                    className='content__manager__checkbox'
                    checked={selectedChildren.length === children.length}
                    toggle={() => {
                      selectedChildren.length === children.length
                        ? children.forEach((child) =>
                            removeRow(`${category}${idBreak}${child.id}`)
                          )
                        : children.forEach((child) =>
                            addRow(`${category}${idBreak}${child.id}`)
                          )
                    }}
                  />
                  <div className='content__manager__category__label'>
                    {category}
                  </div>
                </div>
                {children.map((child) => {
                  const rowId = `${category}${idBreak}${child.id}`
                  return (
                    <ContentManagerRow
                      key={rowId}
                      id={rowId}
                      badges={child.badges}
                      checked={hasRow(rowId)}
                      toggleChecked={() => toggleRow(rowId)}
                      label={child.label}
                      labelHref={child.href}
                      lastUpdated={child.lastUpdated}
                      className='content__manager__item__row'
                      lastUpdatedBy={(child.lastUpdatedBy || []).reduce(
                        (acc, val) => {
                          const user = users.get(val)
                          if (user != null) {
                            acc.push(user)
                          }
                          return acc
                        },
                        [] as AppUser[]
                      )}
                      labelOnclick={(ev: React.MouseEvent) => {
                        ev.preventDefault()
                        push(child.href)
                      }}
                    />
                  )
                })}
              </React.Fragment>
            )
          }
        )}
      </div>
    </Container>
  )
}

function getSortedItems<T extends string>(
  order: string,
  items: ContentManagerItemProps<T>[]
) {
  switch (order) {
    case 'Title A-Z':
      return sortByAttributeAsc('label', items)
    case 'Title Z-A':
      return sortByAttributeDesc('label', items)
    case 'Latest Updated':
    default:
      return sortByAttributeDesc('lastUpdated', items)
  }
}

const Container = styled.div`
  position: relative;
  width: 100%;
  height: 40px;

  .content__manager__header,
  * + .content__manager__row {
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  }

  &:not(.content__manager--active) .content__manager__checkbox {
    opacity: 0;
  }

  .content__manager__category__row:hover .content__manager__checkbox,
  .content__manager__header:hover .content__manager__checkbox {
    opacity: 1 !important;
  }

  .content__manager__checkbox {
    margin: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .content__manager__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 40px;
  }

  .content__manager__header__right {
    flex: 0 0 auto;
  }

  .content__manager__header__left {
    flex: 1 1 10px;
    display: flexbox;
    align-items: center;
    flex-wrap: wrap;

    .content__manager__checkbox {
      display: block;
    }
  }

  .content__manager__category,
  .content__manager__category__row .content__manager__category__label {
    text-transform: uppercase;
    font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  }

  .content__manager__category__row {
    background: ${({ theme }) => theme.colors.background.secondary};
  }

  .content__manager__category__row .content__manager__category__label {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  .content__manager__category__row {
    display: flex;
    align-items: center;
    height: 30px;
  }

  .content__manager__content {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: stretch;
  }
`

export default ContentManager
