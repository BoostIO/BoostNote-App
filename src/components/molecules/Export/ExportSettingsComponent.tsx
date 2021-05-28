import { LocalExportResourceRequestBody } from '../../../lib/v2/hooks/local/useLocalUI'
import { ExportProcedureData } from './ExportProgressItem'
import Form from '../../../shared/components/molecules/Form'
import React, { useCallback, useState } from 'react'
import { FormFolderSelectorInput } from '../../atoms/form'
import { SimpleFormSelect } from '../../../shared/components/molecules/Form/atoms/FormSelect'
import { FormCheckItem } from '../../atoms/form'
import styled from '../../../shared/lib/styled'
import { FormRowProps } from '../../../shared/components/molecules/Form/templates/FormRow'
import { openDialog } from '../../../lib/exports'
import { useTranslation } from 'react-i18next'
interface ExportSettingsComponentProps {
  exportSettings: LocalExportResourceRequestBody
  onStartExport: (exportSettings: ExportProcedureData) => void
}

const ExportSettingsComponent = ({
  exportSettings,
  onStartExport,
}: ExportSettingsComponentProps) => {
  const [exportLocation, setExportLocation] = useState<string>('')
  const [exportFormat, setExportFormat] = useState<string>('pdf')
  const [recursive, setRecursive] = useState<boolean>(
    exportSettings.exportingStorage
  )

  const openDialogAndStoreLocation = useCallback(async () => {
    const location = await openDialog()
    setExportLocation(location)
  }, [setExportLocation])
  const { t } = useTranslation()

  return (
    <ExportSettingsContainer>
      <h2>Export Settings</h2>
      <Form
        rows={[
          {
            description: 'Select export format and location',
          },
          {
            title: 'Export format',
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={exportFormat}
                    onChange={setExportFormat}
                    options={['md', 'html', 'pdf']}
                    labels={['Markdown', 'HTML', 'PDF']}
                  />
                ),
              },
            ],
          },
          ...((!exportSettings.exportingStorage
            ? [
                {
                  title: 'Export sub-folders or just selected folder',
                  items: [
                    {
                      type: 'node',
                      element: (
                        <FormCheckItem
                          id='checkbox-recursive-export'
                          type='checkbox'
                          checked={recursive}
                          onChange={() => setRecursive(!recursive)}
                        >
                          Recursive
                        </FormCheckItem>
                      ),
                    },
                  ],
                },
              ]
            : []) as FormRowProps[]),
          {
            title: 'Location',
            description: 'Select folder destination for documents to export',
            items: [
              {
                type: 'node',
                element: (
                  <FormFolderSelectorInput
                    type='text'
                    onClick={openDialogAndStoreLocation}
                    readOnly
                    value={
                      exportLocation.trim().length === 0
                        ? t('folder.noLocationSelected')
                        : exportLocation
                    }
                  />
                ),
              },
              {
                type: 'button',
                props: {
                  label: 'Select Folder',
                  variant: 'primary',
                  onClick: openDialogAndStoreLocation,
                },
              },
            ],
          },
          {
            description:
              'Export can take a while if you have a lot of documents.',
            items: [
              {
                type: 'button',
                props: {
                  disabled: exportLocation.trim().length === 0,
                  label: 'Start Export',
                  className: 'export__settings__export__button',
                  onClick: () => {
                    onStartExport({
                      ...exportSettings,
                      recursive: recursive,
                      exportType: exportFormat,
                      exportLocation: exportLocation,
                    })
                  },
                },
              },
            ],
          },
        ]}
      />
    </ExportSettingsContainer>
  )
}

const ExportSettingsContainer = styled.div`
  .export__settings__export__button {
    margin-bottom: 7px;
  }
`

export default ExportSettingsComponent
