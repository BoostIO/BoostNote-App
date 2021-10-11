/* 

import React, { useMemo } from 'react'
import { usePage } from '../../../cloud/lib/stores/pageStore'
import { useNav } from '../../../cloud/lib/stores/nav'
import { useTitle } from 'react-use'
import { SerializedDocWithBookmark } from '../../../cloud/interfaces/db/doc'
import ErrorLayout from '../../../design/components/templates/ErrorLayout'
import { GetInitialPropsParameters } from '../../../cloud/interfaces/pages'
import {
  AssigneesCondition,
  LabelsCondition,
  DueDateCondition,
  DateConditionValue,
  CreationDateCondition,
  SerializeDateProps,
  UpdateDateCondition,
} from '../../../cloud/interfaces/db/dashboardFolder'
import { addDays, subDays } from 'date-fns'
import DocOnlyContentManager from '../organisms/DocOnlyContentManager'
import { getTeamIndexPageData } from '../../../cloud/api/pages/teams'
import { localizeDate } from '../../../cloud/components/Modal/contents/DashboardFolder/DocDateSelect'
import AppLayout from '../layouts/AppLayout'
import { mdiFolderCogOutline } from '@mdi/js'
import Icon from '../../../design/components/atoms/Icon'

function validateAssignees(
  doc: SerializedDocWithBookmark,
  condition: AssigneesCondition
) {
  if (doc.assignees == null || doc.assignees.length === 0) {
    return false
  }
  const targetUserIdSet = new Set(condition.value)
  for (const assignee of doc.assignees) {
    if (targetUserIdSet.has(assignee.userId)) {
      return true
    }
  }
  return false
}

function validateLabels(
  doc: SerializedDocWithBookmark,
  condition: LabelsCondition
) {
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
}

function validateDueDate(
  doc: SerializedDocWithBookmark,
  condition: SerializeDateProps<DueDateCondition>
) {
  if (doc.dueDate == null) {
    return false
  }

  return validateDateValue(new Date(doc.dueDate), condition.value)
}

function validateCreationDate(
  doc: SerializedDocWithBookmark,
  condition: SerializeDateProps<CreationDateCondition>
) {
  return validateDateValue(new Date(doc.createdAt), condition.value)
}

function validateUpdateDate(
  doc: SerializedDocWithBookmark,
  condition: SerializeDateProps<UpdateDateCondition>
) {
  if (doc.updatedAt == null) {
    return false
  }

  return validateDateValue(new Date(doc.updatedAt), condition.value)
}

function validateDateValue(
  targetDate: Date,
  dateConditionValue: SerializeDateProps<DateConditionValue>
) {
  const todayDate = localizeDate(new Date())
  const tomorrow = addDays(todayDate, 1)
  const localizedTargetDate = localizeDate(targetDate)

  switch (dateConditionValue.type) {
    case 'today':
      return localizedTargetDate >= todayDate && localizedTargetDate < tomorrow
    case '7_days':
      const weekAgo = subDays(todayDate, 7)
      return localizedTargetDate >= weekAgo && localizedTargetDate < tomorrow
    case '30_days':
      const monthAgo = subDays(todayDate, 30)
      return localizedTargetDate >= monthAgo && localizedTargetDate < tomorrow
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
  }
  return false
}

const DashboardFolderPage = (params: any) => {
  const { team, currentUserIsCoreMember } = usePage()
  const {
    docsMap,
    initialLoadDone,
    workspacesMap,
    dashboardFoldersMap,
  } = useNav()

  const { dashboardFolderId } = params

  const dashboardFolder = dashboardFoldersMap.get(dashboardFolderId)
  const documents = useMemo(() => {
    if (
      dashboardFolder == null ||
      dashboardFolder.condition.conditions.length === 0
    ) {
      return []
    }
    const docs = [...docsMap].map(([_docId, doc]) => doc)

    const primaryConditionType = dashboardFolder.condition.type
    return docs.filter((doc) => {
      for (const secondaryCondition of dashboardFolder.condition.conditions) {
        switch (secondaryCondition.type) {
          case 'status':
            if (doc.status === secondaryCondition.value) {
              if (primaryConditionType === 'and') {
                break
              } else {
                return true
              }
            } else {
              if (primaryConditionType === 'and') {
                return false
              } else {
                break
              }
            }
          case 'assignees':
            if (validateAssignees(doc, secondaryCondition)) {
              if (primaryConditionType === 'and') {
                break
              } else {
                return true
              }
            } else {
              if (primaryConditionType === 'and') {
                return false
              } else {
                break
              }
            }
          case 'labels':
            if (validateLabels(doc, secondaryCondition)) {
              if (primaryConditionType === 'and') {
                break
              } else {
                return true
              }
            } else {
              if (primaryConditionType === 'and') {
                return false
              } else {
                break
              }
            }
          case 'due_date':
            if (validateDueDate(doc, secondaryCondition)) {
              if (primaryConditionType === 'and') {
                break
              } else {
                return true
              }
            } else {
              if (primaryConditionType === 'and') {
                return false
              } else {
                break
              }
            }
          case 'creation_date':
            if (validateCreationDate(doc, secondaryCondition)) {
              if (primaryConditionType === 'and') {
                break
              } else {
                return true
              }
            } else {
              if (primaryConditionType === 'and') {
                return false
              } else {
                break
              }
            }
          case 'update_date':
            if (validateUpdateDate(doc, secondaryCondition)) {
              if (primaryConditionType === 'and') {
                break
              } else {
                return true
              }
            } else {
              if (primaryConditionType === 'and') {
                return false
              } else {
                break
              }
            }
        }
      }
      return primaryConditionType === 'and'
    })
  }, [docsMap, dashboardFolder])

  const pageTitle = useMemo(() => {
    if (team == null || dashboardFolder == null) {
      return 'BoostHub'
    }

    return `Smart Folder : ${dashboardFolder.name} - ${team.name}`
  }, [dashboardFolder, team])

  useTitle(pageTitle)

  if (!initialLoadDone) {
    return <AppLayout>Loading...</AppLayout>
  }

  if (team == null) {
    return (
      <AppLayout>
        <ErrorLayout message={'Team is missing'} />
      </AppLayout>
    )
  }

  if (dashboardFolder == null) {
    return (
      <AppLayout>
        <ErrorLayout message={'The smart folder has been deleted'} />
      </AppLayout>
    )
  }

  return (
    <AppLayout
      title={
        <>
          <Icon size={20} path={mdiFolderCogOutline} />
          {dashboardFolder.name}
        </>
      }
    >
      <DocOnlyContentManager
        team={team}
        documents={documents}
        page='smart-folder'
        workspacesMap={workspacesMap}
        currentUserIsCoreMember={currentUserIsCoreMember}
      />
    </AppLayout>
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

*/
