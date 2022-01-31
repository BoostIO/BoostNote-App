import ContentLoader from 'react-content-loader'
import React from 'react'
import { generate } from 'shortid'
import {
  withLoaderProps,
  useLoaderProps,
} from '../../../../cloud/lib/stores/loaders'

const LoaderTeamPicker = () => {
  const { backgroundColor, foregroundColor, speed, rx, ry } = useLoaderProps()
  return (
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
}

export default withLoaderProps(LoaderTeamPicker)
