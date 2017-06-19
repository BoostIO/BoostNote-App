import {
  Location,
} from 'client/redux'
import g from 'glamorous'
import React from 'react'
import Nav from './Nav'

interface PageViewProps {
  location: Location.State
}

export const PageView = (props: PageViewProps) => {
  return <div>
  {props.location.pathname}
  </div>
}
