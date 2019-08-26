import { observable, action } from 'mobx'
import { Location } from 'history'
import path from 'path'

function normalize(pathname: string): string {
  const normalizedPathname = path.normalize(pathname)
  const normalizedLength = normalizedPathname.length
  if (normalizedPathname[normalizedLength - 1] === '/') {
    return normalizedPathname.slice(0, normalizedLength - 1)
  }
  return normalizedPathname
}

export class RouteStore {
  @observable
  public pathname: string
  @observable
  public search: string
  @observable
  public hash: string
  @observable
  public state?: any

  constructor(location: Location) {
    this.pathname = normalize(location.pathname)
    this.search = location.search
    this.hash = location.hash
    this.state = location.state
  }

  @action
  update(location: Location) {
    this.pathname = normalize(location.pathname)
    this.search = location.search
    this.hash = location.hash
    this.state = location.state
  }
}
