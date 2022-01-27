import ContentLoader from 'react-content-loader'
import React from 'react'
import { CommonLoaderProps } from './types'
import shortid from 'shortid'

export type NavItemLoaderProps = {
  count?: number
  withDepth?: boolean
}

export default ({
  count = 1,
  withDepth,
  speed,
  backgroundColor,
  foregroundColor,
  rx,
  ry,
}: NavItemLoaderProps & CommonLoaderProps) => (
  <>
    {[...Array(count)].map((_val, i) => (
      <ContentLoader
        key={`nav-item-load-${i}`}
        uniqueKey={`nav-item-load-${shortid()}`}
        height={26}
        width='100%'
        speed={speed}
        backgroundColor={backgroundColor}
        foregroundColor={foregroundColor}
      >
        <rect
          x={withDepth && i !== 0 ? '6%' : '2%'}
          y='3'
          rx={rx}
          ry={ry}
          width={withDepth && i !== 0 ? '86%' : '90%'}
          height={20}
        />
      </ContentLoader>
    ))}
  </>
)
