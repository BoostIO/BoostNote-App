import React, { useCallback, useRef, useState } from 'react'
import { mdiArrowLeft, mdiArrowRight, mdiChevronRight } from '@mdi/js'
import { AppComponent } from '../../../../lib/v2/types'
import Button, { ButtonProps, ButtonVariant } from '../../atoms/Button'
import Icon from '../../atoms/Icon'
import TopbarBreadcrumb from './molecules/TopbarBreadcrumb'
import { BreadCrumbTreeItem } from '../../../../lib/v2/mappers/types'
import {
  MenuTypes,
  useContextMenu,
} from '../../../../lib/v2/stores/contextMenu'
import TopbarTree from './molecules/TopbarTree'
import cc from 'classcat'
import { scrollbarOverlay } from '../../../../lib/v2/styled/styleFunctions'
import WithTooltip from '../../atoms/WithTooltip'
import styled from '../../../../lib/v2/styled'

export interface TopbarBreadcrumbProps {
  link: { href: string; navigateTo: () => void }
  label: string
  emoji?: string
  icon?: string
  parentId: string
  active?: boolean
  controls?: { label: string; onClick: () => void }[]
}

export interface TopbarPageProps {
  controls?: (ButtonProps & {
    variant: ButtonVariant
    label?: React.ReactNode
    tooltip?: React.ReactNode
  })[]
  breadcrumbs?: TopbarBreadcrumbProps[]
}

export type TopbarProps = TopbarPageProps & {
  tree?: Map<string, BreadCrumbTreeItem[]>
  navigation?: {
    goBack?: () => void
    goForward?: () => void
  }
  children?: React.ReactNode
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
  const [scrollingBreadcrumbs, setScrollingBreadcrumbs] = useState(false)
  const scrollTimer = useRef<any>()
  const onScrollHandler: React.UIEventHandler<HTMLDivElement> = useCallback(() => {
    setScrollingBreadcrumbs(true)
    scrollTimer.current = setTimeout(() => {
      setScrollingBreadcrumbs(false)
    }, 600)
  }, [])

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
            variant='icon-secondary'
            iconSize={20}
            iconPath={mdiArrowLeft}
            disabled={navigation?.goBack == null}
            onClick={() =>
              navigation?.goBack != null ? navigation.goBack() : undefined
            }
          />
          <Button
            variant='icon-secondary'
            iconSize={20}
            size={'sm'}
            iconPath={mdiArrowRight}
            disabled={navigation?.goForward == null}
            onClick={() =>
              navigation?.goForward != null ? navigation.goForward() : undefined
            }
          />
        </div>
        <div
          className={cc([
            'topbar__breadcrumbs',
            scrollingBreadcrumbs && 'topbar__breadcrumbs--scrolling',
          ])}
          onScroll={onScrollHandler}
        >
          {breadcrumbs.map((breadcrumb, i) => (
            <React.Fragment key={`topbar__breadcrumb__${i}`}>
              <TopbarBreadcrumb
                id={`topbar__breadcrumb__${i}`}
                className='topbar__breadcrumbs__item'
                label={breadcrumb.label}
                href={breadcrumb.link.href}
                active={breadcrumb.active}
                emoji={breadcrumb.emoji}
                defaultIcon={breadcrumb.icon}
                onContextMenu={(event: React.MouseEvent) => {
                  event.preventDefault()
                  event.stopPropagation()
                  if (breadcrumb.controls == null) {
                    return
                  }
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
                <Icon
                  path={mdiChevronRight}
                  size={16}
                  className='topbar__separator'
                />
              )}
            </React.Fragment>
          ))}
          {children != null && (
            <div className='topbar__children'>{children}</div>
          )}
        </div>
      </div>
      {controls.length > 0 && (
        <div className='topbar__controls'>
          {controls.map((control, i) => (
            <WithTooltip
              key={`topbar__control__${i}`}
              tooltip={control.tooltip}
              side='bottom'
            >
              <Button
                variant={control.variant}
                iconSize={20}
                size={'sm'}
                iconPath={control.iconPath}
                disabled={control.disabled}
                active={control.active}
                onClick={control.onClick}
              >
                {control.label}
              </Button>
            </WithTooltip>
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
  font-size: ${({ theme }) => theme.sizes.fonts.df}px;
  flex: 0 0 auto;
  -webkit-app-region: drag;
  padding-left: ${({ theme }) => theme.sizes.spaces.sm}px;
  padding-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  min-width: 100%;

  .topbar__content {
    flex: 1 1 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    height: 100%;
    min-width: 0;
  }

  .topbar__controls,
  .topbar__navigation,
  .topbar__separator {
    display: flex;
    min-width: 0;
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
    margin: 0 -1px;
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

  .topbar__children {
    display: flex;
    flex: 1 1 10px;
    height: 100%;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.subtle};
  }

  .topbar__breadcrumbs {
    display: flex;
    flex: 1 1 10px;
    height: 100%;
    align-items: center;
    color: ${({ theme }) => theme.colors.text.subtle};
    ${(theme) => scrollbarOverlay(theme, 'x', 'topbar__breadcrumbs--scrolling')}
  }
`

export default Topbar
