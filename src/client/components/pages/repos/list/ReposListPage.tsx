import * as React from 'react'

interface ReposListPageStateProps {
  repositories: string[]
}

const ReposListPage = ({
  repositories
}: ReposListPageStateProps) => (
  <div>
    List of repos
    <ul>
      {repositories
        .map(name => (
          <li key={name}>{name}</li>
        ))
      }
    </ul>
  </div>
)

export default ReposListPage
