import { observable, action } from 'mobx'
import { MenuItem } from '../lib/contextMenu/interfaces'

export default class ContextMenuStore {
  @observable isOpen: boolean = false
  @observable xPosition: number = 0
  @observable yPosition: number = 0
  @observable menuItems: MenuItem[] = []
  @observable id: number = 0

  @action
  open(event: React.MouseEvent<unknown>, menuItems: MenuItem[]) {
    this.isOpen = true
    this.xPosition = event.clientX
    this.yPosition = event.clientY
    this.menuItems = menuItems
    this.id++
    console.log(event.clientX, event.clientY)
    // TODO: Adjust x and y position based on event and height of menu
    // 1. Calculate menu height
    // 2. Get x and y position of mouse cursor
    // 3. Determine where to put menu
    //   - If there is enough space, show menu at the cursor
    //   - If there is not enough space, shrink menu and make it scrollable.
  }

  @action
  close() {
    this.isOpen = false
  }
}
