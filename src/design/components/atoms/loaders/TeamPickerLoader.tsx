import ContentLoader from 'react-content-loader'
import React from 'react'
import { CommonLoaderProps } from './types'
import { generate } from 'shortid'

export type TeamPickerLoaderProps = {}

export default ({
  backgroundColor,
  foregroundColor,
  speed,
  rx,
  ry,
}: TeamPickerLoaderProps & CommonLoaderProps) => (
  <ContentLoader
    uniqueKey={`team-picker-load-${generate()}`}
    height={32}
    width='100%'
    speed={speed}
    backgroundColor={backgroundColor}
    foregroundColor={foregroundColor}
  >
    <rect x='10' y='2' rx={rx} ry={ry} width='72%' height='100%' />
    <rect x='80%' y='2' rx={rx} ry={ry} width='14%' height='100%' />
  </ContentLoader>
)
