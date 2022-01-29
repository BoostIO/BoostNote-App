import ContentLoader from 'react-content-loader'
import React from 'react'
import { CommonLoaderProps } from './types'
import { rightSideTopBarHeight } from '../../organisms/Topbar'
import { generate } from 'shortid'

export type TopbarLoaderProps = {}

export default ({
  backgroundColor,
  foregroundColor,
  speed,
  rx,
  ry,
}: TopbarLoaderProps & CommonLoaderProps) => (
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

export const TopbarBreadcrumbLoader = ({
  backgroundColor,
  foregroundColor,
  speed,
  rx,
  ry,
}: CommonLoaderProps) => (
  <ContentLoader
    uniqueKey='topbar-breadcrumb-load'
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
