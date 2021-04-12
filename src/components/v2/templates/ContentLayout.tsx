import React, { useCallback } from 'react'
import styled from '../../../lib/v2/styled'
import { AppComponent } from '../../../lib/v2/types'
import DoublePane from '../atoms/DoublePane'
import PageHelmet from '../atoms/PageHelmet'
import Topbar, { TopbarProps } from '../organisms/Topbar/index'
import cc from 'classcat'
import { isFocusRightSideShortcut } from '../../../lib/v2/shortcuts'
import {
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
} from '../../../lib/v2/keyboard'
import { focusFirstChildFromElement } from '../../../lib/v2/dom'

export interface ContentLayoutProps {
  helmet?: { title?: string; indexing?: boolean }
  header?: React.ReactNode
  topbar?:
    | (TopbarProps & { type: 'v2' })
    | { type: 'v1'; left: React.ReactNode; right?: React.ReactNode }
  right?: React.ReactNode
  reduced?: boolean
}

const ContentLayout: AppComponent<ContentLayoutProps> = ({
  children,
  helmet,
  topbar,
  right,
  reduced,
  header,
}) => {
  const rightSideContentRef = React.createRef<HTMLDivElement>()
  const keydownHandler = useCallback(
    async (event: KeyboardEvent) => {
      if (isFocusRightSideShortcut(event)) {
        preventKeyboardEventPropagation(event)
        console.log('focus ne')
        focusFirstChildFromElement(rightSideContentRef.current)
      }
    },
    [rightSideContentRef]
  )
  useGlobalKeyDownHandler(keydownHandler)

  return (
    <Container className='layout' ref={rightSideContentRef}>
      <PageHelmet title={helmet?.title} indexing={helmet?.indexing} />
      <DoublePane className='two__pane' right={right}>
        {topbar?.type === 'v2' ? (
          <Topbar
            tree={topbar.tree}
            controls={topbar.controls}
            navigation={topbar.navigation}
            breadcrumbs={topbar.breadcrumbs}
            className='topbar'
          />
        ) : (
          <div className='topbar topbar--v1'>
            {topbar?.type === 'v1' && (
              <>
                <div className='topbar--v1__left'>{topbar?.left}</div>
                {topbar?.right != null && (
                  <div className='topbar--v1__right'>{topbar?.right}</div>
                )}
              </>
            )}
          </div>
        )}
        <div className='layout__content'>
          <div className='layout__content__wrapper'>
            <div
              className={cc([
                'content__wrapper',
                reduced && 'content__wrapper--reduced',
              ])}
            >
              {header != null && (
                <h1 className='layout__content__header'>{header}</h1>
              )}
              {children}
            </div>
          </div>
        </div>
      </DoublePane>
    </Container>
  )
}

const Container = styled.div`
  flex: 1 1 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  .two__pane {
    width: 100%;
    height: 100%;

    .two__pane__left {
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }

    .topbar {
      flex: 0 0 auto;
    }

    .layout__content {
      flex: 1 1 auto;
      overflow: hidden;
    }

    .layout__content__wrapper {
      height: 100%;
      width: 100%;
      overflow: auto;
    }

    .content_wrapper {
      flex: 1 1 auto;
    }

    .content__wrapper--reduced {
      max-width: 920px;
      padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
      margin: auto;
    }

    .topbar--v1 {
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

      .topbar--v1__left {
        display: flex;
        flex: 2 2 auto;
        align-items: center;
        min-width: 0;
        height: 100%;
        margin-left: ${({ theme }) => theme.sizes.spaces.xsm}px;
      }

      .topbar--v1__right {
        display: flex;
        justify-content: flex-end;
        flex: 0 0 auto;
        align-items: center;
        min-width: 0;
        height: 100%;
        flex-grow: 0;
        flex-shrink: 0;
      }
    }
  }

  .layout__content__header {
    display: flex;
    justify-content: left;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
    margin-top: ${({ theme }) => theme.sizes.spaces.l}px;
    font-size: 48pxpx;
  }
`

export default ContentLayout
