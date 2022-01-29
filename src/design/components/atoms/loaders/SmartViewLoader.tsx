import ContentLoader from 'react-content-loader'
import React from 'react'
import { CommonLoaderProps } from './types'
import { generate } from 'shortid'

export type SmartViewLoaderProps = {}

export default ({
  backgroundColor,
  foregroundColor,
  speed,
  rx,
  ry,
}: SmartViewLoaderProps & CommonLoaderProps) => (
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
