import ContentLoader from 'react-content-loader'
import React from 'react'
import { rightSideTopBarHeight } from '../../organisms/Topbar'
import { generate } from 'shortid'
import { withLoaderProps } from '../../../../cloud/lib/stores/loaders'
import { useLoaderStore } from '../../../../cloud/lib/stores/loaders/store'

const LoaderTopbar = () => {
  const { backgroundColor, foregroundColor, speed, rx, ry } = useLoaderStore()
  return (
    <ContentLoader
      uniqueKey={`topbar-load-${generate()}`}
      height={rightSideTopBarHeight}
      width='100%'
      speed={speed}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect
        x='10'
        y='8'
        rx={rx}
        ry={ry}
        width={30}
        height={rightSideTopBarHeight - 16}
      />
      <rect
        x='50'
        y='8'
        rx={rx}
        ry={ry}
        width={30}
        height={rightSideTopBarHeight - 16}
      />
      <rect
        x='90'
        y='8'
        rx={rx}
        ry={ry}
        width={320}
        height={rightSideTopBarHeight - 16}
      />
    </ContentLoader>
  )
}

export default withLoaderProps(LoaderTopbar)
