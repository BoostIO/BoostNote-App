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
  topbar?: TopbarProps
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
        {topbar != null ? (
          <Topbar
            tree={topbar.tree}
            controls={topbar.controls}
            navigation={topbar.navigation}
            breadcrumbs={topbar.breadcrumbs}
            className='topbar'
          >
            {topbar.children}
          </Topbar>
        ) : (
          <div className='topbar topbar--placeholder'>{topbar}</div>
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
  min-width: 100%;

  .two__pane {
    width: 100%;
    height: 100%;

    .two__pane__left {
      display: flex;
      flex-direction: column;
    }

    .topbar {
      width: 100%;
      flex: 0 0 auto;
    }

    .layout__content {
      flex: 1 1 auto;
    }

    .layout__content__wrapper {
      height: 100%;
      width: 100%;
    }

    .content__wrapper {
      flex: 1 1 auto;
      height: 100%;
    }

    .content__wrapper--reduced {
      max-width: 1280px;
      padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
      margin: auto;
    }

    .topbar--placeholder {
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
    margin: ${({ theme }) => theme.sizes.spaces.df}px 0;
    font-size: 16px;
  }
`

export default ContentLayout
