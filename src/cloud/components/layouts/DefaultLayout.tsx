import React from 'react'

const DefaultLayout = (props: React.PropsWithChildren<{}>) => (
  <div>{props.children}</div>
)

export const LazyDefaultLayout = DefaultLayout

export default DefaultLayout
