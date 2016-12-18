import Immutable from 'immutable'

const defaultKeymap = Immutable.fromJS({
  main: {
  },
  nav: {
    A: 'title:new-note',
    'Shift-A': 'nav:new-folder',
    Enter: 'list:focus',
    Right: 'list:focus',
    Up: 'nav:up',
    Down: 'nav:down',
    D: 'nav:delete'
  },
  list: {
    Enter: 'detail:focus',
    E: 'detail:focus',
    Esc: 'nav:focus',
    Up: 'list:up',
    Left: 'nav:focus',
    Right: 'detail:focus',
    Down: 'list:down',
    A: 'title:new-note',
    D: 'list:delete'
  },
  detail: {
    Esc: 'list:focus',
    'Shift-Cmd-7': 'detail:focus-tag-select',
    'Cmd-\'': 'detail:focus-tag-select'
  }
})

function keymap (state = defaultKeymap, ation) {
  return state
}

export default keymap
