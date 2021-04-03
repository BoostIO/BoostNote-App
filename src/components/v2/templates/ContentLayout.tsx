import React from 'react'
import styled from '../../../lib/v2/styled'
import { AppComponent } from '../../../lib/v2/types'
import DoublePane from '../atoms/DoublePane'
import PageHelmet from '../atoms/PageHelmet'
import Topbar, { TopbarProps } from '../organisms/Topbar/index'

export interface ContentLayoutProps {
  helmet?: { title?: string; indexing?: boolean }
  topbar: TopbarProps
  right?: React.ReactNode
}

const ContentLayout: AppComponent<ContentLayoutProps> = ({
  children,
  helmet,
  topbar,
  right,
}) => (
  <Container className='layout'>
    <PageHelmet title={helmet?.title} indexing={helmet?.indexing} />
    <DoublePane className='two__pane' right={right}>
      <Topbar
        tree={topbar.tree}
        controls={topbar.controls}
        navigation={topbar.navigation}
        breadcrumbs={topbar.breadcrumbs}
        className='topbar'
      />
      <div className='layout__content'>
        <div className='layout__content__wrapper'>{children}</div>
      </div>
    </DoublePane>
  </Container>
)

const Container = styled.div`
  flex: 1 1 0;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  .two__pane {
    width: 100%;
    display: flex;
    .two__pane__left {
      flex-direction: column;
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
      overflow: auto;
    }
  }
`

export default ContentLayout
