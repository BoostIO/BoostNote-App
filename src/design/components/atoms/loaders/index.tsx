import React, { useMemo } from 'react'
import { useSettings } from '../../../../cloud/lib/stores/settings'
import { selectV2Theme } from '../../../lib/styled/styleFunctions'
import DocEditorLoader from './DocEditorLoader'
import FolderPageLoader from './FolderPageLoader'
import NavItemLoader, { NavItemLoaderProps } from './NavItemLoader'
import SmartViewLoader from './SmartViewLoader'
import TeamPickerLoader from './TeamPickerLoader'
import TopbarLoader, { TopbarBreadcrumbLoader } from './TopbarLoader'

type LoaderProps = {} & (
  | {
      variant: 'team-picker'
    }
  | {
      variant: 'topbar'
    }
  | {
      variant: 'doc-editor'
    }
  | ({ variant: 'nav-item' } & NavItemLoaderProps)
  | {
      variant: 'topbar-breadcrumb'
    }
  | {
      variant: 'folder-page'
    }
  | { variant: 'smart-view' }
)

const commonLoaderSpeed = 6
const commonRadiuses = 6
const Loader = ({ variant, ...props }: LoaderProps) => {
  const { settings } = useSettings()

  const colors = useMemo(() => {
    const theme = selectV2Theme(settings['general.theme'] || 'dark')

    return {
      backgroundColor: theme.colors.background.tertiary,
      foregroundColor: theme.colors.text.subtle,
    }
  }, [settings])

  switch (variant) {
    case 'smart-view':
      return (
        <SmartViewLoader
          {...colors}
          {...props}
          speed={commonLoaderSpeed}
          rx={commonRadiuses}
          ry={commonRadiuses}
        />
      )
    case 'folder-page':
      return (
        <FolderPageLoader
          {...colors}
          {...props}
          speed={commonLoaderSpeed}
          rx={commonRadiuses}
          ry={commonRadiuses}
        />
      )
    case 'topbar-breadcrumb':
      return (
        <TopbarBreadcrumbLoader
          {...colors}
          {...props}
          speed={commonLoaderSpeed}
          rx={commonRadiuses}
          ry={commonRadiuses}
        />
      )
    case 'topbar':
      return (
        <TopbarLoader
          {...colors}
          {...props}
          speed={commonLoaderSpeed}
          rx={commonRadiuses}
          ry={commonRadiuses}
        />
      )
    case 'team-picker':
      return (
        <TeamPickerLoader
          {...colors}
          {...props}
          speed={commonLoaderSpeed}
          rx={commonRadiuses}
          ry={commonRadiuses}
        />
      )
    case 'doc-editor':
      return (
        <DocEditorLoader
          {...colors}
          {...props}
          speed={commonLoaderSpeed}
          rx={commonRadiuses}
          ry={commonRadiuses}
        />
      )
    case 'nav-item':
    default:
      return (
        <NavItemLoader
          {...colors}
          {...props}
          speed={commonLoaderSpeed}
          rx={commonRadiuses}
          ry={commonRadiuses}
        />
      )
  }
}

export default Loader
