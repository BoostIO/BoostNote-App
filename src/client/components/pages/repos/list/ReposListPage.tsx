import * as React from 'react'

interface ReposListPageStateProps {
  repositoryMap: {
    [name: string]: {}
  }
}

const ReposListPage = ({
  repositoryMap
}: ReposListPageStateProps) => (
  <div>
    List of repos
    <ul>
      {
        Object.entries(repositoryMap)
          .map(([name, repository]) => (
            <li key={name}>{name}</li>
          ))
      }
    </ul>
  </div>
)

export default ReposListPage
