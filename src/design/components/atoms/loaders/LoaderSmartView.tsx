import ContentLoader from 'react-content-loader'
import React from 'react'
import { generate } from 'shortid'
import {
  withLoaderProps,
  useLoaderProps,
} from '../../../../cloud/lib/stores/loaders'

const LoaderSmartView = () => {
  const { backgroundColor, foregroundColor, speed, rx, ry } = useLoaderProps()
  return (
    <ContentLoader
      uniqueKey={`smart-view-load-${generate()}`}
      height={'100%'}
      width='100%'
      speed={speed}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect x='2%' y='0' rx={rx} ry={ry} height={'10%'} width={'96%'} />
      <rect x='2%' y='12%' rx={rx} ry={ry} height={'86%'} width={'96%'} />
    </ContentLoader>
  )
}

export default withLoaderProps(LoaderSmartView)
