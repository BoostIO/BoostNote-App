import { observable, action } from 'mobx'
import { MenuItem } from '../lib/contextMenu/interfaces'
import {
  menuHeight,
  menuMargin,
  menuVerticalPadding
} from '../lib/contextMenu/consts'

export default class ContextMenuStore {
  @observable isOpen: boolean = false
  @observable xPosition: number = 0
  @observable yPosition: number = 0
  @observable menuItems: MenuItem[] = []
  @observable id: number = 0

  @action
  open(event: React.MouseEvent<unknown>, menuItems: MenuItem[]) {
    this.isOpen = true
    this.id++
    this.menuItems = menuItems

    // TODO: Limit xPosition
    this.xPosition = event.clientX

    const yPositionLimit =
      window.innerHeight - menuHeight - menuMargin - menuVerticalPadding * 2
    const clientYIsLowerThanYPositionLimit = event.clientY > yPositionLimit
    this.yPosition = clientYIsLowerThanYPositionLimit
      ? yPositionLimit
      : event.clientY
  }

  @action
  close() {
    this.isOpen = false
  }
}
