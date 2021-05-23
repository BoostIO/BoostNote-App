import React, { useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { useNav } from '../../../lib/stores/nav'
import { useTitle } from 'react-use'
import { DocStatus } from '../../../interfaces/db/doc'
import Application from '../../../components/Application'
import ErrorLayout from '../../../../shared/components/templates/ErrorLayout'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import DocOnlyContentManager from '../../../components/molecules/ContentManager/DocOnlyContentManager'
import { getTeamIndexPageData } from '../../../api/pages/teams'
import { useRouter } from '../../../lib/router'
import styled from '../../../../shared/lib/styled'
import DocStatusIcon from '../../../components/atoms/DocStatusIcon'

const DocStatusShowPage = () => {
  const { team } = usePage()
  const { docsMap, initialLoadDone, workspacesMap } = useNav()
  const { pathname } = useRouter()

  const docStatus = useMemo<DocStatus>(() => {
    const [, , , status] = pathname.split('/')

    switch (status) {
      case 'paused':
        return 'paused'
      case 'completed':
        return 'completed'
      case 'archived':
        return 'archived'
      case 'in-progress':
      default:
        return 'in_progress'
    }
  }, [pathname])

  const docStatusLabel = useMemo(() => {
    const [, , , status] = pathname.split('/')

    switch (status) {
      case 'paused':
        return 'Paused'
      case 'completed':
        return 'Completed'
      case 'archived':
        return 'Archived'
      case 'in-progress':
      default:
        return 'In Progress'
    }
  }, [pathname])

  const documents = useMemo(() => {
    const docs = [...docsMap].map(([_docId, doc]) => doc)

    return docs.filter((doc) => doc.status === docStatus)
  }, [docsMap, docStatus])

  const pageTitle = useMemo(() => {
    if (team == null) {
      return 'BoostHub'
    }

    return `Docs with status - ${team.name}`
  }, [team])

  useTitle(pageTitle)

  if (!initialLoadDone) {
    return (
      <Application
        content={{
          reduced: true,
        }}
      >
        Loading...
      </Application>
    )
  }

  if (team == null) {
    return (
      <Application
        content={{
          reduced: true,
        }}
      >
        <ErrorLayout message={'Team is missing'} />
      </Application>
    )
  }

  return (
    <Application
      content={{
        topbar: {
          children: (
            <TopbarLabel>
              <DocStatusIcon
                status={docStatus}
                size={16}
                className='topbar-label__icon'
              />
              {docStatusLabel}
            </TopbarLabel>
          ),
        },
      }}
    >
      <DocOnlyContentManager
        team={team}
        documents={documents}
        workspacesMap={workspacesMap}
      />
    </Application>
  )
}

DocStatusShowPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getTeamIndexPageData(params)
  return result
}

export default DocStatusShowPage

const TopbarLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  display: flex;
  align-items: center;
  .topbar-label__icon {
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`
