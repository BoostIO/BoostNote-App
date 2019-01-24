import { observable, action } from 'mobx'
import { MenuItem } from '../lib/contextMenu/interfaces'

export default class ContextMenuStore {
  @observable isOpen: boolean = false
  @observable xPosition: number = 0
  @observable yPosition: number = 0
  @observable menuItems: MenuItem[] = []

  @action
  open(event: React.MouseEvent<any>, menuItems: MenuItem[]) {
    this.isOpen = true
    console.log(event, menuItems)
    // TODO: Adjust x and y position based on event and height of menu
    // 1. Calculate menu height
    // 2. Get x and y position of mouse cursor
    // 3. Determine where to put menu
    //   - If there is enough space, show menu at the cursor
    //   - If there is not enough space, shrink menu and make it scrollable.
  }
}
