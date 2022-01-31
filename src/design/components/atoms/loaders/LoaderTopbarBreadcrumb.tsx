import ContentLoader from 'react-content-loader'
import React from 'react'
import { rightSideTopBarHeight } from '../../organisms/Topbar'
import { generate } from 'shortid'
import { withLoaderProps } from '../../../../cloud/lib/stores/loaders'
import { useLoaderStore } from '../../../../cloud/lib/stores/loaders/store'

const LoaderTopbarBreadcrumb = () => {
  const { backgroundColor, foregroundColor, speed, rx, ry } = useLoaderStore()
  return (
    <ContentLoader
      uniqueKey={`topbar-breadcrumb-load-${generate()}`}
      height={rightSideTopBarHeight}
      width='100%'
      speed={speed}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect
        x='0'
        y='8'
        rx={rx}
        ry={ry}
        width={120}
        height={rightSideTopBarHeight - 16}
      />
    </ContentLoader>
  )
}

export default withLoaderProps(LoaderTopbarBreadcrumb)
