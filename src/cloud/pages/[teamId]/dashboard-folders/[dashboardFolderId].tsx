import React, { useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { useNav } from '../../../lib/stores/nav'
import { useTitle } from 'react-use'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import {
  SerializeDateProps,
  Condition,
  DateCondition,
  SerializedQuery,
} from '../../../interfaces/db/dashboard'
import { addDays, addSeconds, isEqual } from 'date-fns'
import ContentManager from '../../../components/ContentManager'
import { getTeamIndexPageData } from '../../../api/pages/teams'
import styled from '../../../../design/lib/styled'
import InviteCTAButton from '../../../components/buttons/InviteCTAButton'
import { mdiDotsHorizontal } from '@mdi/js'
import { useModal } from '../../../../design/lib/stores/modal'
import DashboardFolderContextMenu from '../../../components/DashboardFolderContextMenu'
import FolderPageInviteSection from '../../../components/Onboarding/FolderPageInviteSection'
import ApplicationPage from '../../../components/ApplicationPage'
import ColoredBlock from '../../../../design/components/atoms/ColoredBlock'
import ApplicationTopbar from '../../../components/ApplicationTopbar'
import ApplicationContent from '../../../components/ApplicationContent'
import { localizeDate } from '../../../components/Modal/contents/Dashboard/DocDateSelect'
import { Kind } from '../../../components/Modal/contents/Dashboard/interfaces'

type Validators = {
  [P in Condition['type']]: (
    doc: SerializedDocWithSupplemental,
    condition: SerializeDateProps<Kind<Condition, P>>
  ) => boolean
}

const validators: Validators = {
  label: (doc, condition) => {
    if (doc.tags.length === 0) {
      return false
    }
    const targetTagSet = new Set(condition.value)
    for (const tag of doc.tags) {
      if (targetTagSet.has(tag.id)) {
        return true
      }
    }
    return false
  },

  due_date: (doc, condition) => {
    if (doc.props.dueDate == null) {
      return false
    }
    return validateDateValue(new Date(doc.props.dueDate.data), condition.value)
  },

  creation_date: (doc, condition) => {
    return validateDateValue(new Date(doc.createdAt), condition.value)
  },

  update_date: (doc, condition) => {
    if (doc.updatedAt == null) {
      return false
    }
    return validateDateValue(new Date(doc.updatedAt), condition.value)
  },

  prop: (doc, condition) => {
    const prop = doc.props[condition.value.name]
    switch (prop.type) {
      case 'date':
        return equalsOrContains(isEqual, prop.data, condition.value.value)
      case 'json':
        return false
      case 'user':
        return equalsOrContains(
          (permission, id) => permission.user.id === id,
          prop.data,
          condition.value.value
        )
      case 'number':
        return equalsOrContains(
          (n, n2) => n === Number(n2),
          prop.data,
          condition.value.value
        )
      case 'string':
        return equalsOrContains(
          (s1, s2) => s1 === s2,
          prop.data,
          condition.value.value
        )
      default:
        return false
    }
  },

  query: (_doc, _condition) => {
    return false
  },
}

function equalsOrContains<T, U>(
  cmp: (t1: T, t2: U) => boolean,
  test1: T | T[],
  test2: U
): boolean {
  return Array.isArray(test1)
    ? test1.some((item) => cmp(item, test2))
    : cmp(test1, test2)
}

function validateDateValue(
  targetDate: Date,
  dateConditionValue: SerializeDateProps<DateCondition>
) {
  const todayDate = localizeDate(new Date())
  const localizedTargetDate = localizeDate(targetDate)

  switch (dateConditionValue.type) {
    case 'relative':
      return (
        localizedTargetDate >= addSeconds(todayDate, dateConditionValue.period)
      )
    case 'after':
      const afterDate = new Date(dateConditionValue.date)
      return localizedTargetDate >= afterDate
    case 'specific':
      const specificDate = new Date(dateConditionValue.date)
      return (
        localizedTargetDate >= specificDate &&
        localizedTargetDate < addDays(specificDate, 1)
      )
    case 'before':
      const beforeDate = new Date(dateConditionValue.date)
      return localizedTargetDate < beforeDate
    case 'between':
      const fromDate = new Date(dateConditionValue.from)
      const toDate = new Date(dateConditionValue.to)
      return localizedTargetDate >= fromDate && localizedTargetDate <= toDate
    default:
      return false
  }
}

function checkRule(test1: boolean, test2: boolean, rule: 'and' | 'or') {
  return rule === 'or' ? test1 || test2 : test1 && test2
}

function buildQueryCheck(query: SerializedQuery) {
  return (doc: SerializedDocWithSupplemental) => {
    return query.reduce((result, condition) => {
      const validator = validators[condition.type]
      return checkRule(result, validator(doc, condition as any), condition.rule)
    }, true)
  }
}

const DashboardFolderPage = (params: any) => {
  const { team, currentUserIsCoreMember } = usePage()
  const {
    docsMap,
    initialLoadDone,
    workspacesMap,
    dashboardsMap: dashboardFoldersMap,
  } = useNav()
  const { openContextModal } = useModal()

  const { dashboardFolderId } = params

  const dashboardFolder = dashboardFoldersMap.get(dashboardFolderId)
  const documents = useMemo(() => {
    if (dashboardFolder == null || dashboardFolder.condition.length === 0) {
      return []
    }
    const docs = [...docsMap].map(([_docId, doc]) => doc)

    return docs.filter(buildQueryCheck(dashboardFolder.condition))
  }, [docsMap, dashboardFolder])

  const pageTitle = useMemo(() => {
    if (team == null || dashboardFolder == null) {
      return 'BoostHub'
    }

    return `Smart Folder : ${dashboardFolder.name} - ${team.name}`
  }, [dashboardFolder, team])

  useTitle(pageTitle)

  if (!initialLoadDone) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>Loading...</ApplicationContent>
      </ApplicationPage>
    )
  }

  if (team == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>{'Team is missing'}</ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  if (dashboardFolder == null) {
    return (
      <ApplicationPage showingTopbarPlaceholder={true}>
        <ApplicationContent reduced={true}>
          <ColoredBlock variant='danger'>
            {'The smart folder has been deleted'}
          </ColoredBlock>
        </ApplicationContent>
      </ApplicationPage>
    )
  }

  return (
    <ApplicationPage>
      <ApplicationTopbar
        controls={[
          {
            type: 'node',
            element: <InviteCTAButton key='invite-cta' />,
          },
          {
            type: 'button',
            variant: 'icon',
            iconPath: mdiDotsHorizontal,
            onClick: (event) => {
              openContextModal(
                event,
                <DashboardFolderContextMenu
                  dashboard={dashboardFolder}
                  team={team}
                />,
                {
                  alignment: 'bottom-right',
                  removePadding: true,
                  hideBackground: true,
                }
              )
            },
          },
        ]}
      >
        <DashboardFolderLabel>{dashboardFolder.name}</DashboardFolderLabel>
      </ApplicationTopbar>
      <ApplicationContent>
        <FolderPageInviteSection />
        <ContentManager
          team={team}
          documents={documents}
          workspacesMap={workspacesMap}
          page={'smart-folder'}
          currentUserIsCoreMember={currentUserIsCoreMember}
        />
      </ApplicationContent>
    </ApplicationPage>
  )
}

DashboardFolderPage.getInitialProps = async (
  params: GetInitialPropsParameters
) => {
  const result = await getTeamIndexPageData(params)

  const [, , , dashboardFolderId] = params.pathname.split('/')
  return {
    ...result,
    dashboardFolderId,
  }
}

export default DashboardFolderPage

const DashboardFolderLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
`
