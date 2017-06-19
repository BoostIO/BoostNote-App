import { history } from 'client/lib/history'
import * as React from 'react'

type LinkProps = React.HTMLAttributes<HTMLAnchorElement>

const onClickCreator = (props: LinkProps) => (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault()
  history.push(props.href)
}

export const Link = (props: LinkProps) => (
  <a
    onClick={onClickCreator(props)}
    {...props}
  />
)
