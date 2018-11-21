import { observable, action } from 'mobx'
import { Location } from 'history'

export default class RouteStore {
  @observable
  public pathname: string
  @observable
  public search: string
  @observable
  public hash: string
  @observable
  public state?: any

  constructor(location: Location) {
    this.pathname = location.pathname
    this.search = location.search
    this.hash = location.hash
    this.state = location.state
  }

  @action
  update(location: Location) {
    this.pathname = location.pathname
    this.search = location.search
    this.hash = location.hash
    this.state = location.state
  }
}
