import * as React from 'react'
import styled from 'styled-components'

const Root = styled.div`
  display: flex;
  .nav {
    width: 100px
  }
  .list {
    width: 100px;
  }
  .detail {
    flex: 1;
  }
`

class App extends React.Component {
  render () {
    return (
      <Root>
        <div className='nav'>Folder Selector</div>
        <div className='panel'>Note List</div>
        <div className='panel'>Note Detail</div>
      </Root>
    )
  }
}

export default App
