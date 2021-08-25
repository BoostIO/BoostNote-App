import React, { PropsWithChildren, useCallback, useRef } from 'react'
import styled from '../../lib/styled'
import { AppComponent } from '../../lib/types'
import DoublePane from '../atoms/DoublePane'
import PageHelmet from '../atoms/PageHelmet'
import cc from 'classcat'
import { isFocusRightSideShortcut } from '../../lib/shortcuts'
import {
  preventKeyboardEventPropagation,
  useGlobalKeyDownHandler,
} from '../../lib/keyboard'
import { focusFirstChildFromElement } from '../../lib/dom'
import Topbar, { TopbarPlaceholder, TopbarProps } from '../organisms/Topbar'

export interface ContentLayoutProps {
  helmet?: { title?: string; indexing?: boolean }
  header?: React.ReactNode
  right?: React.ReactNode
  reduced?: boolean
}

const ContentLayout: AppComponent<ContentLayoutProps> = ({
  helmet,
  right,
  children,
}) => {
  const rightSideContentRef = useRef<HTMLDivElement>(null)
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
      <DoublePane
        className='two__pane content__layout'
        right={right}
        rightFlex='0 0 auto'
        idRight='content__layout__right'
      >
        {children}
      </DoublePane>
    </Container>
  )
}

export interface ChartedContentLayoutProps {
  helmet?: { title?: string; indexing?: boolean }
  header?: React.ReactNode
  topbar?: TopbarProps
  right?: React.ReactNode
  reduced?: boolean
}

export const ChartedContentLayout: AppComponent<ChartedContentLayoutProps> = ({
  children,
  helmet,
  topbar,
  right,
  reduced,
  header,
}) => {
  return (
    <ContentLayout helmet={helmet} right={right}>
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
        <TopbarPlaceholder />
      )}
      <ContentWrapper reduced={reduced} header={header}>
        {children}
      </ContentWrapper>
    </ContentLayout>
  )
}

export interface ContentWrapperProps {
  header?: React.ReactNode
  reduced?: boolean
}

export const ContentWrapper = ({
  reduced,
  header,
  children,
}: PropsWithChildren<ContentWrapperProps>) => {
  return (
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
  )
}

const Container = styled.div`
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  height: 100vh;

  .two__pane {
    width: 100%;
    height: 100%;
    overflow: hidden;

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
      overflow: auto;
    }

    .layout__content__wrapper {
      height: 100%;
      width: 100%;
    }

    .content__wrapper {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      height: 100%;
      position: relative;
    }

    .content__wrapper--reduced {
      max-width: 1280px;
      padding: 0 ${({ theme }) => theme.sizes.spaces.sm}px;
      margin: auto;
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
