import * as React from 'react'

interface ReposListPageStateProps {
  repositoryMap: {
    [name: string]: {}
  }
}

const ReposListPage = (props: ReposListPageStateProps) => (
  <div>
    List of repos
  </div>
)

export default ReposListPage
