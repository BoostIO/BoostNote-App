import { history } from 'client/lib'
import g from 'glamorous'
import React from 'react'
import { Themes } from 'style'
import { TrackableMap } from 'typed-redux-kit'
import { Link } from 'client/shared'

const TEMP_NAV_WIDTH = 150

const Styled = {
  Root: g.nav({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    transition: 'width 0.3s',
  }, (props: {isNavOpen: boolean}, theme: Themes.Theme) => ({
    width: props.isNavOpen
      ? TEMP_NAV_WIDTH
      : 0,
    borderRight: theme.ui.border,
  })),
  Body: g.div({
    width: TEMP_NAV_WIDTH,
    flex: 1,
  }),
  Bottom: g.div({
    width: TEMP_NAV_WIDTH,
    height: 36,
    display: 'flex',
  }),
  BottomPlusButton: g.button({
    flex: 1,
    border: 'none',
  }),
  BottomMoreButton: g.button({
    width: 36,
  }, (props: any, theme: Themes.Theme) => ({
    borderLeft: theme.ui.border,
  })),
  Repos: g.div({

  }),
  ReposHeaderButton: g.button({
    width: '100%',
  }),
}

interface NavProps {
  isNavOpen: boolean
  repositories: [string, {
    noteMap: TrackableMap<string, {}>
    folderMap: TrackableMap<string, {}>
  }][]
}

const goToRootPage = () => {
  history.push('/')
}

const goToNewRepoPage = () => {
  history.push('/new-repo')
}

const Nav = (props: NavProps) => (
  <Styled.Root isNavOpen={props.isNavOpen} >
    <Styled.Body>
      <Styled.Repos>
        <Styled.ReposHeaderButton
          onClick={goToRootPage}
        >
          Repos
        </Styled.ReposHeaderButton>
        {props.repositories.map(([repositoryName, repository]) => {
          return (
          <div key={repositoryName}>
            <div>
              <Link href={`/repos/${repositoryName}`}>{repositoryName}</Link>
            </div>
            <div>
              {repository.folderMap.mapToArray((folder, folderName) => (
                <div key={folderName}>{folderName}</div>)
              )}
            </div>
          </div>
        )})}
      </Styled.Repos>
    </Styled.Body>
    <Styled.Bottom>
      <Styled.BottomPlusButton
        onClick={goToNewRepoPage}
      >
        + Add Repo/Folder
      </Styled.BottomPlusButton>
      <Styled.BottomMoreButton>
        ...
      </Styled.BottomMoreButton>
    </Styled.Bottom>
  </Styled.Root>
)

export default Nav
