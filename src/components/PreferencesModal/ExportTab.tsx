import React, { useCallback } from 'react'
import { SectionHeader } from './styled'
import { MarginType, PageSize, usePreferences } from '../../lib/preferences'
import { useTranslation } from 'react-i18next'
import { FormCheckItem } from '../atoms/form'
import { SimpleFormSelect } from '../../shared/components/molecules/Form/atoms/FormSelect'
import Form from '../../shared/components/molecules/Form'
import { parseNumberStringOrReturnZero } from '../../lib/string'

const ExportTab = () => {
  const { t } = useTranslation()
  const { preferences, setPreferences } = usePreferences()

  const selectMargins = useCallback(
    (marginsType) => {
      setPreferences({
        'export.printOptions': {
          ...preferences['export.printOptions'],
          marginsType: parseNumberStringOrReturnZero(marginsType),
        },
      })
    },
    [preferences, setPreferences]
  )

  const selectPageSize = useCallback(
    (pageSize) => {
      setPreferences({
        'export.printOptions': {
          ...preferences['export.printOptions'],
          pageSize: pageSize,
        },
      })
    },
    [preferences, setPreferences]
  )

  const toggleFrontMatterExport: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setPreferences({
        'markdown.includeFrontMatter': event.target.checked,
      })
    },
    [setPreferences]
  )

  const togglePrintBackground: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setPreferences({
        'export.printOptions': {
          ...preferences['export.printOptions'],
          printBackground: event.target.checked,
        },
      })
    },
    [preferences, setPreferences]
  )

  const toggleLandscapeType: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      setPreferences({
        'export.printOptions': {
          ...preferences['export.printOptions'],
          landscape: event.target.checked,
        },
      })
    },
    [preferences, setPreferences]
  )

  return (
    <div>
      <SectionHeader>{t('preferences.exportTab')}</SectionHeader>
      <Form
        rows={[
          {
            description:
              'All options are used for PDF export except include front matter which is used for markdown export.',
          },
          {
            title: t('preferences.marginType'),
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={preferences['export.printOptions'].marginsType + ''}
                    onChange={selectMargins}
                    options={[
                      MarginType.NoMargins + '',
                      MarginType.DefaultMargins + '',
                      MarginType.MinimumMargins + '',
                    ]}
                    labels={[
                      'No margins',
                      'Default Margins',
                      'Minimum Margins',
                    ]}
                  />
                ),
              },
            ],
          },
          {
            title: t('preferences.pageSize'),
            items: [
              {
                type: 'node',
                element: (
                  <SimpleFormSelect
                    value={preferences['export.printOptions'].pageSize + ''}
                    onChange={selectPageSize}
                    options={[
                      PageSize.A3,
                      PageSize.A4,
                      PageSize.Legal,
                      PageSize.Letter,
                      PageSize.Tabloid,
                    ]}
                  />
                ),
              },
            ],
          },
          {
            items: [
              {
                type: 'node',
                element: (
                  <FormCheckItem
                    id='checkbox-print-background'
                    type='checkbox'
                    checked={preferences['export.printOptions'].printBackground}
                    onChange={togglePrintBackground}
                  >
                    {t('preferences.printBackground')}
                  </FormCheckItem>
                ),
              },
            ],
          },
          {
            items: [
              {
                type: 'node',
                element: (
                  <FormCheckItem
                    id='checkbox-landscape'
                    type='checkbox'
                    checked={preferences['export.printOptions'].landscape}
                    onChange={toggleLandscapeType}
                  >
                    {t('preferences.landscape')}
                  </FormCheckItem>
                ),
              },
            ],
          },
          {
            items: [
              {
                type: 'node',
                element: (
                  <FormCheckItem
                    id='checkbox-include-front-matter'
                    type='checkbox'
                    checked={preferences['markdown.includeFrontMatter']}
                    onChange={toggleFrontMatterExport}
                  >
                    {t('preferences.includeFrontMatter')}
                  </FormCheckItem>
                ),
              },
            ],
          },
        ]}
      />
    </div>
  )
}

export default ExportTab
