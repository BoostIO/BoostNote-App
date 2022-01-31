import ContentLoader from 'react-content-loader'
import React from 'react'
import { generate } from 'shortid'
import { withLoaderProps } from '../../../../cloud/lib/stores/loaders'
import { useLoaderStore } from '../../../../cloud/lib/stores/loaders/store'

const DocEditorLoader = () => {
  const { backgroundColor, foregroundColor, speed, rx, ry } = useLoaderStore()
  return (
    <ContentLoader
      uniqueKey={`doc-editor-item-load-${generate()}`}
      height={450}
      width='100%'
      speed={speed}
      backgroundColor={backgroundColor}
      foregroundColor={foregroundColor}
    >
      <rect x='0' y='8' rx={rx} ry={ry} width={'100%'} height={100} />
      <rect x='0' y='116' rx={rx} ry={ry} width={'100%'} height={160} />
    </ContentLoader>
  )
}

export default withLoaderProps(DocEditorLoader)
