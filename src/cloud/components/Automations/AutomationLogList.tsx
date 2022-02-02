import React, { useEffect } from 'react'
import Table from '../../../design/components/organisms/Table'
import Icon from '../../../design/components/atoms/Icon'
import { SerializedAutomationLog } from '../../interfaces/db/automations'
import { mdiCheckBold, mdiExclamationThick } from '@mdi/js'
import { format } from 'date-fns'

interface AutomationLogListProps {
  logs: SerializedAutomationLog[]
}

const AutomationLogList = ({ logs }: AutomationLogListProps) => {
  useEffect(() => {
    console.log(logs)
  }, [logs])

  return (
    <Table
      disabledAddColumn={true}
      disabledAddRow={true}
      stickyFirstCol={false}
      cols={[
        { children: '', width: 25 },
        { children: 'Date', width: 200 },
        { children: 'Type' },
        { children: 'Info', width: 500 },
      ]}
      rows={logs.map((log) => {
        return {
          cells: [
            {
              children: (
                <Icon path={log.isError ? mdiExclamationThick : mdiCheckBold} />
              ),
            },
            {
              children: format(new Date(log.createdAt), 'u/MM/dd:HH:mm:ss'),
            },
            { children: log.type },
            { children: log.info },
          ],
        }
      })}
    />
  )
}

export default AutomationLogList
