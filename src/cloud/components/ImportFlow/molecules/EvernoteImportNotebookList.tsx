import React, { useCallback, useMemo, useState } from 'react'
import { useI18n } from '../../../lib/hooks/useI18n'
import { lngKeys } from '../../../lib/i18n/types'
import styled from '../../../../design/lib/styled'
import Form from '../../../../design/components/molecules/Form'
import { CheckboxWithLabel } from '../../../../design/components/molecules/Form/atoms/FormCheckbox'
import cc from 'classcat'
import { NotebookMetadata } from '../../../pages/migrations/EvernoteMigrate'
import { SerializedTeamWithPermissions } from '../../../interfaces/db/team'
import { SerializedSubscription } from '../../../interfaces/db/subscription'
import Spinner from '../../../../design/components/atoms/Spinner'
import { useToast } from '../../../../design/lib/stores/toast'

interface EvernoteImportNotebookListProps {
  notebooks: NotebookMetadata[]
  onSelect: (
    selectedNotebooks: NotebookMetadata[],
    selectedSpace: string
  ) => void
  teams: (SerializedTeamWithPermissions & {
    subscription?: SerializedSubscription
  })[]
}

const EvernoteImportNotebookList = ({
  teams,
  notebooks,
  onSelect,
}: EvernoteImportNotebookListProps) => {
  const { translate } = useI18n()
  const [selectedSpace, setSelectedSpace] = useState<string>('')
  const [notebookNames] = useState<string[]>(
    notebooks.map((n) => n.notebookName)
  )
  const [selectedNotebooks, setSelectedNotebooks] = useState<string[]>([])
  const { pushMessage } = useToast()

  const toggleNotebookSelection = useCallback((notebookName: string) => {
    setSelectedNotebooks((prev) => {
      const deselectNotebook = prev.includes(notebookName)
      if (deselectNotebook) {
        return [...prev.filter((n) => n !== notebookName)]
      } else {
        return [...prev, notebookName]
      }
    })
  }, [])

  const allRowsAreSelected = useMemo(() => {
    return selectedNotebooks.length == notebooks.length
  }, [notebooks.length, selectedNotebooks.length])

  const selectAllRows = useCallback(
    (selectingAllDocs) => {
      if (selectingAllDocs) {
        setSelectedNotebooks(notebookNames)
      } else {
        setSelectedNotebooks([])
      }
    },
    [notebookNames]
  )

  const selectSpace = useCallback((selectedTeamId) => {
    setSelectedSpace(selectedTeamId)
  }, [])

  const onImport = useCallback(() => {
    const notebooksToImport = notebooks.filter((n) =>
      selectedNotebooks.includes(n.notebookName)
    )
    const numNotes = notebooksToImport.reduce(
      (sum, notebook) => notebook.noteCount + sum,
      0
    )
    if (numNotes === 0) {
      pushMessage({
        title: 'Migration Error',
        description: 'Please select at least one note to import.',
      })
      return
    }
    onSelect(notebooksToImport, selectedSpace)
  }, [notebooks, onSelect, pushMessage, selectedNotebooks, selectedSpace])

  return (
    <Container>
      <Form
        rows={[
          {
            description: 'Select notebook(s) to import',
          },
          {
            items: [
              {
                type: 'node',
                element: (
                  <div className='notebook-select-all-row__checkbox__wrapper'>
                    <CheckboxWithLabel
                      label={
                        selectedNotebooks.length === notebooks.length
                          ? 'Deselect All'
                          : 'Select All'
                      }
                      className={cc([
                        'notebook-select-all-row__checkbox',
                        allRowsAreSelected &&
                          'notebook-select-all-row__checkbox--checked',
                      ])}
                      checked={allRowsAreSelected}
                      toggle={() => selectAllRows(!allRowsAreSelected)}
                    />
                  </div>
                ),
              },
            ],
          },
          {
            items: [
              {
                type: 'node',
                element: (
                  <EvernoteNotebookList
                    notebooks={notebooks}
                    selectedNotebooks={selectedNotebooks}
                    toggleNotebookSelection={toggleNotebookSelection}
                  />
                ),
              },
            ],
          },
          {
            title: 'Select a destination space',
            description:
              'Notebook(s) will be imported in a separate folder, and each notebook will be sub-folder.',
            items: [
              {
                type: 'select--string',
                props: {
                  value: selectedSpace,
                  onChange: selectSpace,
                  options: teams.map((team) => team.id),
                  labels: teams.map((team) => team.name),
                  placeholder: 'Select Space',
                },
              },
            ],
          },
          {
            items: [
              {
                type: 'button',
                props: {
                  variant: 'primary',
                  disabled:
                    selectedSpace === '' || selectedNotebooks.length === 0,
                  onClick: () => onImport(),
                  label: translate(lngKeys.GeneralImport),
                },
              },
            ],
          },
        ]}
      />
    </Container>
  )
}

interface EvernoteNotebookListProps {
  notebooks: NotebookMetadata[]
  selectedNotebooks: string[]
  toggleNotebookSelection: (selectedNotebook: string) => void
}

const EvernoteNotebookList = ({
  notebooks,
  selectedNotebooks,
  toggleNotebookSelection,
}: EvernoteNotebookListProps) => {
  return (
    <NotebookContainer>
      {notebooks.length == 0 && <Spinner variant={'subtle'} size={45} />}
      {notebooks.map((notebook) => {
        const notebookName = notebook.notebookName
        return (
          <div
            key={notebook.notebookId}
            className='notebook-row__checkbox__wrapper'
          >
            <CheckboxWithLabel
              label={notebookName}
              className={cc([
                'notebook-row__checkbox',
                selectedNotebooks.includes(notebookName) &&
                  'notebook-row__checkbox--checked',
              ])}
              checked={selectedNotebooks.includes(notebookName)}
              toggle={() => toggleNotebookSelection(notebookName)}
            />
            <div>{notebook.noteCount}</div>
          </div>
        )
      })}
    </NotebookContainer>
  )
}

const NotebookContainer = styled.div`
  display: flex;
  flex-direction: column;
`

const Container = styled.div`
  width: 100%;
  .notebook-select-all-row__checkbox__wrapper {
    display: flex;
    align-items: center;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.sm}px;
  }

  .notebook-row__checkbox__wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: ${({ theme }) => theme.sizes.spaces.xsm}px;
  }

  .notebook-row__checkbox {
    margin-left: ${({ theme }) => theme.sizes.spaces.sm}px;
    margin-right: ${({ theme }) => theme.sizes.spaces.sm}px;
  }
`

export default EvernoteImportNotebookList
