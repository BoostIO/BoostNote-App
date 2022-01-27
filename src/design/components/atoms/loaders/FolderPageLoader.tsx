import ContentLoader from 'react-content-loader'
import React from 'react'
import { CommonLoaderProps } from './types'

export type FolderPageLoaderProps = {}

export default ({
  backgroundColor,
  foregroundColor,
  speed,
  rx,
  ry,
}: FolderPageLoaderProps & CommonLoaderProps) => (
  <ContentLoader
    uniqueKey='folder-page-load'
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
