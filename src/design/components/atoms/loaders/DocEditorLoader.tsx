import ContentLoader from 'react-content-loader'
import React from 'react'
import { CommonLoaderProps } from './types'

export type DocEditorLoaderProps = {}

export default ({
  backgroundColor,
  foregroundColor,
  speed,
  rx,
  ry,
}: DocEditorLoaderProps & CommonLoaderProps) => (
  <ContentLoader
    uniqueKey='doc-editor-item-load'
    height={450}
    width='100%'
    speed={speed}
    backgroundColor={backgroundColor}
    foregroundColor={foregroundColor}
  >
    <rect x='0' y='8' rx={rx} ry={ry} width={'100%'} height={100} />
    <rect x='0' y='116' rx={rx} ry={ry} width={'100%'} height={100} />
    <rect x='0' y='224' rx={rx} ry={ry} width={'100%'} height={100} />
  </ContentLoader>
)
