import React, { useMemo } from 'react'
import { usePage } from '../../../lib/stores/pageStore'
import { useNav } from '../../../lib/stores/nav'
import { useTitle } from 'react-use'
import { SerializedDocWithBookmark } from '../../../interfaces/db/doc'
import Application from '../../../components/Application'
import ErrorLayout from '../../../../shared/components/templates/ErrorLayout'
import { GetInitialPropsParameters } from '../../../interfaces/pages'
import {
  getSmartFolderShowPageData,
  SmartFolderShowPageResponseBody,
} from '../../../api/pages/teams/smart-folders'
import {
  AssigneesCondition,
  LabelsCondition,
  DueDateCondition,
  DateConditionValue,
  CreationDateCondition,
  SerializeDateProps,
  UpdateDateCondition,
} from '../../../interfaces/db/smartFolder'
import { format as formatDate, addDays, subDays } from 'date-fns'
import DocOnlyContentManager from '../../../components/molecules/ContentManager/DocOnlyContentManager'

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
  const todayDate = new Date(formatDate(new Date(), `yyyy-MM-dd`))
  const tomorrow = addDays(todayDate, 1)

  switch (dateConditionValue.type) {
    case 'today':
      return targetDate >= todayDate && targetDate < tomorrow
    case '7_days':
      const weekAgo = subDays(todayDate, 7)
      return targetDate >= weekAgo && targetDate < tomorrow
    case '30_days':
      const monthAgo = subDays(todayDate, 30)
      return targetDate >= monthAgo && targetDate < tomorrow
    case 'after':
      const afterDate = new Date(dateConditionValue.date)
      return targetDate >= afterDate
    case 'before':
      const beforeDate = new Date(dateConditionValue.date)
      return targetDate < beforeDate
    case 'between':
      const fromDate = new Date(dateConditionValue.from)
      const toDate = new Date(dateConditionValue.to)
      return targetDate >= fromDate && targetDate <= toDate
  }
  return false
}

const SmartFolderPage = ({ smartFolder }: SmartFolderShowPageResponseBody) => {
  const { team } = usePage()
  const { docsMap, initialLoadDone, workspacesMap } = useNav()

  const documents = useMemo(() => {
    if (smartFolder.condition.conditions.length === 0) {
      return []
    }
    const docs = [...docsMap].map(([_docId, doc]) => doc)

    const primaryConditionType = smartFolder.condition.type
    return docs.filter((doc) => {
      for (const secondaryCondition of smartFolder.condition.conditions) {
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
              if (primaryConditionType !== 'and') {
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
  }, [docsMap, smartFolder])

  const pageTitle = useMemo(() => {
    if (team == null) {
      return 'BoostHub'
    }

    return `Smart Folder : ${smartFolder.name} - ${team.name}`
  }, [smartFolder, team])

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

  if (smartFolder == null) {
    return (
      <Application
        content={{
          reduced: true,
        }}
      >
        <ErrorLayout message={'The folder has been deleted'} />
      </Application>
    )
  }

  return (
    <Application
      content={{
        reduced: true,
        topbar: {
          controls: [],
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

SmartFolderPage.getInitialProps = async (params: GetInitialPropsParameters) => {
  const result = await getSmartFolderShowPageData(params)
  return result
}

export default SmartFolderPage
