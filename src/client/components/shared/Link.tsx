import { history } from 'client/lib/history'
import * as React from 'react'

type LinkProps = React.HTMLAttributes<HTMLAnchorElement>

const Link = (props: LinkProps) => {
  const goToHref = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    history.push(props.href)
  }

  return (
    <a
      onClick={goToHref}
      {...props}
    />
  )
}

export default Link
