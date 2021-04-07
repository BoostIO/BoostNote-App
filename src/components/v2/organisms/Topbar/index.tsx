import React, { useCallback, useState } from 'react'
import { mdiArrowLeft, mdiArrowRight, mdiChevronRight } from '@mdi/js'
import styled from '../../../../lib/v2/styled'
import { AppComponent, ControlButtonProps } from '../../../../lib/v2/types'
import Button from '../../atoms/Button'
import Icon from '../../atoms/Icon'
import TopbarBreadcrumb from './molecules/TopbarBreadcrumb'
import { BreadCrumbTreeItem } from '../../../../lib/v2/mappers/types'
import {
  MenuTypes,
  useContextMenu,
} from '../../../../lib/v2/stores/contextMenu'
import TopbarTree from './molecules/TopbarTree'

export interface TopbarProps {
  controls?: ControlButtonProps[]
  breadcrumbs?: {
    link: { href: string; navigateTo: () => void }
    label: string
    parentId: string
    active?: boolean
    controls: { label: string; onClick: () => void }[]
  }[]
  tree?: Map<string, BreadCrumbTreeItem[]>
  navigation?: {
    goBack?: () => void
    goForward?: () => void
  }
}

const Topbar: AppComponent<TopbarProps> = ({
  children,
  controls = [],
  breadcrumbs = [],
  navigation,
  tree,
}) => {
  const { popup } = useContextMenu()
  const [treeState, setTreeState] = useState<{
    bottom: number
    left: number
    id: string
  }>()

  const openNavTree = useCallback(
    (parentId: string, props: { bottom: number; left: number }) => {
      setTreeState({ bottom: props.bottom, left: props.left, id: parentId })
    },
    []
  )

  return (
    <Container className='topbar'>
      <div className='topbar__content'>
        {treeState != null && tree != null && (
          <TopbarTree
            state={treeState}
            close={() => setTreeState(undefined)}
            tree={tree}
          />
        )}
        <div className='topbar__navigation'>
          <Button
            variant='icon'
            iconSize={22}
            iconPath={mdiArrowLeft}
            disabled={navigation?.goBack == null}
            onClick={() =>
              navigation?.goBack != null ? navigation.goBack() : undefined
            }
          />
          <Button
            variant='icon'
            iconSize={22}
            size={'sm'}
            iconPath={mdiArrowRight}
            disabled={navigation?.goForward == null}
            onClick={() =>
              navigation?.goForward != null ? navigation.goForward() : undefined
            }
          />
        </div>
        <div className='topbar__breadcrumbs'>
          {breadcrumbs.map((breadcrumb, i) => (
            <React.Fragment key={`topbar__breadcrumb__${i}`}>
              <TopbarBreadcrumb
                id={`topbar__breadcrumb__${i}`}
                className='topbar__breadcrumbs__item'
                label={breadcrumb.label}
                href={breadcrumb.link.href}
                controls={breadcrumb.controls}
                active={breadcrumb.active}
                onContextMenu={(event: React.MouseEvent) => {
                  event.preventDefault()
                  event.stopPropagation()
                  popup(
                    event,
                    breadcrumb.controls.map((control) => {
                      return {
                        type: MenuTypes.Normal,
                        label: control.label,
                        onClick: control.onClick,
                      }
                    })
                  )
                }}
                onClick={(props) => openNavTree(breadcrumb.parentId, props)}
                onDoubleClick={breadcrumb.link.navigateTo}
              />
              {i !== breadcrumbs.length - 1 && (
                <Icon path={mdiChevronRight} size={16} />
              )}
            </React.Fragment>
          ))}
        </div>
        {children}
      </div>
      {controls.length > 0 && (
        <div className='topbar__controls'>
          {controls.map((control, i) => (
            <Button
              key={`topbar__control__${i}`}
              variant='icon'
              iconSize={22}
              size={'sm'}
              iconPath={control.icon}
              disabled={control.disabled}
              onClick={control.onClick}
            />
          ))}
        </div>
      )}
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 44px;
  background: ${({ theme }) => theme.colors.background.primary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.main};
  align-items: center;
  justify-content: space-between;
  z-index: 1;
  font-size: ${({ theme }) => theme.sizes.fonts.sm}px;
  flex: 0 0 auto;
  -webkit-app-region: drag;
  padding-left: ${({ theme }) => theme.sizes.spaces.l}px;
  padding-right: ${({ theme }) => theme.sizes.spaces.l}px;

  .topbar__content {
    flex: 1 1 0;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
  }

  .topbar__controls,
  .topbar__navigation {
    display: flex;
    flex: 0 0 auto;
    flex-wrap: nowrap;
    align-items: center;
  }

  .topbar__navigation button {
    cursor: pointer;
  }

  .topbar__separator {
    height: 24px;
    width: 24px;
    margin: 0 -5px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colors.text.subtle};
    font-size: 14px;
    user-select: none;
    flex-grow: 0;
    flex-basis: auto;
    flex-shrink: 0;
  }

  .topbar__breadcrumbs {
    display: flex;
    flex: 1 1 10px;
    height: 100%;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.subtle};
    overflow-x: hidden;

    .topbar__breadcrumbs__item {
      display: flex;
      align-items: center;
      padding: 2px 4px;
      border-radius: 3px;
      white-space: nowrap;
      background-color: transparent;
      color: ${({ theme }) => theme.colors.text.primary};
      cursor: pointer;
      text-decoration: none !important;

      .label {
        margin-left: 4px;
      }
      .hoverIcon {
        margin-left: 4px;
        opacity: 0;
      }

      &:hover,
      &:focus {
        background-color: ${({ theme }) => theme.colors.background.tertiary};
        .hoverIcon {
          opacity: 1;
        }
      }
    }
  }
`

export default Topbar
