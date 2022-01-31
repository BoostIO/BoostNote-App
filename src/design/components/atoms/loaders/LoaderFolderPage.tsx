import ContentLoader from 'react-content-loader'
import React from 'react'
import { generate } from 'shortid'
import {
  withLoaderProps,
  useLoaderProps,
} from '../../../../cloud/lib/stores/loaders'

const LoaderFolderPage = () => {
  const { backgroundColor, foregroundColor, speed, rx, ry } = useLoaderProps()
  return (
    <ContentLoader
      uniqueKey={`folder-page-load-${generate()}`}
      height={400}
      width='100%'
      speed={speed}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect x='4%' y='8' rx={rx} ry={ry} height={30} width={'92%'} />
      <rect x='4%' y='46' rx={rx} ry={ry} height={360} width={'92%'} />
    </ContentLoader>
  )
}

export default withLoaderProps(LoaderFolderPage)
