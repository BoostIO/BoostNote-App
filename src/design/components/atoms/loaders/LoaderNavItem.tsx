import ContentLoader from 'react-content-loader'
import React from 'react'
import shortid from 'shortid'
import {
  withLoaderProps,
  useLoaderProps,
} from '../../../../cloud/lib/stores/loaders'

export type LoaderNavItemProps = {
  count?: number
  withDepth?: boolean
}

const LoaderNavItem = ({ count = 1, withDepth }: LoaderNavItemProps) => {
  const { backgroundColor, foregroundColor, speed, rx, ry } = useLoaderProps()
  return (
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
}

export default withLoaderProps(LoaderNavItem)
