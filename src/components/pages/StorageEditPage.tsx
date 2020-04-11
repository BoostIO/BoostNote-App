import React, { useCallback, useState, useEffect, useRef } from 'react'
import { useDb } from '../../lib/db'
import { NoteStorage, PopulatedFolderDoc } from '../../lib/db/types'
import { useRouter } from '../../lib/router'
import { useDialog, DialogIconTypes } from '../../lib/dialog'
import { useToast } from '../../lib/toast'
import { useTranslation } from 'react-i18next'
import PageContainer from '../atoms/PageContainer'
import {
  FormHeading,
  FormGroup,
  FormLabel,
  FormTextInput,
  FormBlockquote,
  FormPrimaryButton,
  FormSecondaryButton,
} from '../atoms/form'
import LinkCloudStorageForm from '../organisms/LinkCloudStorageForm'
import ManageCloudStorageForm from '../organisms/ManageCloudStorageForm'
import { values } from '../../lib/db/utils'
import FolderList from '../organisms/FolderList/FolderList'
import { generateId } from '../../lib/string'
import _ from 'lodash'

interface StorageEditProps {
  storage: NoteStorage
}

export default ({ storage }: StorageEditProps) => {
  const db = useDb()
  const router = useRouter()
  const { t } = useTranslation()
  const [name, setName] = useState(storage.name)
  const { messageBox } = useDialog()
  const { pushMessage } = useToast()

  useEffect(() => {
    if (folderTreeDataState === prevFolderTreeState) {
      const newStorage = db.storageMap[storage.id]
      if (newStorage != undefined) {
        setFolderTreeDataState(getFolderTreeData(values(newStorage.folderMap)))
      }
    }
  })

  function usePrevious(value: any) {
    const ref = useRef()
    useEffect(() => {
      ref.current = value
    })
    return ref.current
  }

  const removeCallback = useCallback(() => {
    messageBox({
      title: `Remove "${storage.name}" storage`,
      message: t('storage.removeMessage'),
      iconType: DialogIconTypes.Warning,
      buttons: [t('storage.remove'), t('general.cancel')],
      defaultButtonIndex: 0,
      cancelButtonIndex: 1,
      onClose: async (value: number | null) => {
        if (value === 0) {
          try {
            await db.removeStorage(storage.id)
            router.push('/app')
          } catch {
            pushMessage({
              title: t('general.networkError'),
              description: `An error occurred while deleting storage (id: ${storage.id})`,
            })
          }
        }
      },
    })
  }, [storage, t, db, router, messageBox, pushMessage])

  const updateStorageName = useCallback(() => {
    db.renameStorage(storage.id, name)
  }, [storage.id, db, name])

  const getFolderTreeData = (folderArray: PopulatedFolderDoc[]) => {
    folderArray.sort((a, b) => {
      return a.pathname.length - b.pathname.length
    })
    let result: object[] = []
    folderArray.forEach((folder) => {
      if (folder.pathname !== '/') {
        const paths = folder.pathname.split('/')
        paths.splice(0, 1)
        result = setPathArrayRecursively(
          paths,
          result,
          folder.pathname,
          String(folder.order)
        )
      }
    })
    return transformArrayToMap(result)
  }

  const setPathArrayRecursively = (
    input: string[],
    tempResult: object[],
    pathname?: string,
    order?: string
  ) => {
    const key = input.shift()
    if (key == null) return []
    if (!_.isEmpty(tempResult[key])) {
      tempResult[key]['children'] = setPathArrayRecursively(
        input,
        tempResult[key]['children'],
        pathname,
        order
      )
    } else {
      if (_.isEmpty(input)) {
        tempResult[key] = { pathname: pathname, order: order, children: [] }
      } else {
        tempResult[key] = {
          children: setPathArrayRecursively(input, [], pathname, order),
        }
      }
    }
    return tempResult
  }

  const transformArrayToMap = (input: object[]) => {
    const result: object[] = []
    Object.keys(input).map((key) => {
        return { data: input[key], key: key }
      })
      .sort((a, b) => {
        const aOrder = a.data.order === undefined ? 0 : a.data.order!
        const bOrder = b.data.order === undefined ? 0 : b.data.order!
        if (aOrder === bOrder) {
          return a.data.pathname.localeCompare(b.data.pathname)
        } else {
          return aOrder - bOrder
        }
      })
      .forEach((val) => {
        if (Object.keys(val.data['children']).length > 0) {
          result.push({
            title: val.key,
            pathname: val.data['pathname'],
            children: transformArrayToMap(val.data['children']),
            expanded: true,
          })
        } else {
          result.push({
            title: val.key,
            pathname: val.data['pathname'],
          })
        }
      })
    return result
  }

  const [folderTreeDataState, setFolderTreeDataState] = useState(
    getFolderTreeData(values(storage.folderMap))
  )
  const prevFolderTreeState = usePrevious(folderTreeDataState)

  const updateFolderTreeData = (treeData: object[]) => {
    if (!isDuplicateFolderPathname(treeData)) {
      setFolderTreeDataState(treeData)
    }
  }

  const isDuplicateFolderPathname = (treeData: object[]) => {
    const pathnames: Record<string, string>[] = []
    treeData.map((folder) => {
      organizeFolderTrees(false, folder, '/', pathnames)
    })
    const newPathnameEntries = pathnames.map(
      (pathname: Record<string, string>) => pathname['new']
    )
    return _.uniq(newPathnameEntries).length !== newPathnameEntries.length
  }

  const organizeFolderTrees = useCallback(
    (
      execUpdate: boolean,
      folder: object,
      pathname: string,
      pathnames: Record<string, string>[],
      order = 0
    ) => {
      pathnames.push({
        old: folder['pathname'],
        new: pathname + folder['title'],
        order: order,
      })
      if (!_.isEmpty(folder['children'])) {
        folder['children'].forEach((child: object) => {
          organizeFolderTrees(
            execUpdate,
            child,
            pathname + folder['title'] + '/',
            pathnames,
            ++order
          )
        })
      }
      return order
    },
    []
  )

  const rearrangeFolders = useCallback(async () => {
    const pathnames: Record<string, string>[] = []
    let order = 0
    folderTreeDataState.map((folder) => {
      order = organizeFolderTrees(false, folder, '/', pathnames, ++order)
    })
    const pathnamesToReplace: Record<string, string>[] = []
    const swapTargetInfo: string[] = []
    pathnames
      .sort((a, b) => a.new.length - b.new.length)
      .forEach((pathname, idx) => {
        if (pathname.old !== pathname.new) {
          if (!_.isEmpty(swapTargetInfo[idx])) {
            pathnamesToReplace.push({
              old: swapTargetInfo[idx],
              new: pathname.new,
              swapTargetPathname: '',
              order: pathname.order,
            })
          } else {
            let swapTargetIdx = -1
            for (let i = idx + 1; i < pathnames.length; i++) {
              if (pathname.new === pathnames[i].old) {
                swapTargetIdx = i
              }
            }
            if (swapTargetIdx < 0) {
              pathnamesToReplace.push({
                old: pathname.old,
                new: pathname.new,
                swapTargetPathname: '',
                order: pathname.order,
              })
            } else {
              const swapTargetPathname = `/${generateId()}`
              pathnamesToReplace.push({
                old: pathname.old,
                new: pathname.new,
                swapTargetPathname: swapTargetPathname,
                order: pathname.order,
              })
              swapTargetInfo[swapTargetIdx] = swapTargetPathname
            }
          }
        } else {
          pathnamesToReplace.push({
            old: pathname.old,
            new: '',
            swapTargetPathname: '',
            order: pathname.order,
          })
        }
      })
    for (const val of pathnamesToReplace) {
      if (_.isEmpty(val.new)) {
        await db.reorderFolder(storage.id, val.old, parseInt(val.order))
      } else {
        if (!_.isEmpty(val.swapTargetPathname)) {
          await db.renameFolder(
            storage.id,
            val.new,
            val.swapTargetPathname,
            false,
            parseInt(val.order)
          )
        }
        await db.renameFolder(
          storage.id,
          val.old,
          val.new,
          false,
          parseInt(val.order)
        )
      }
    }
  }, [db, folderTreeDataState, organizeFolderTrees, storage.id])

  return (
    <PageContainer>
      <FormHeading depth={1}>Storage Settings</FormHeading>
      <FormGroup>
        <FormLabel>{t('storage.name')}</FormLabel>
        <FormTextInput
          type='text'
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
        />
      </FormGroup>
      <FormGroup>
        <FormPrimaryButton onClick={updateStorageName}>
          Update storage name
        </FormPrimaryButton>
      </FormGroup>
      <hr />
      <FormHeading depth={2}>Folders</FormHeading>
      <FolderList
        folderTreeData={folderTreeDataState}
        handleFolderTreeDataUpdated={updateFolderTreeData}
      ></FolderList>
      <FormGroup>
        <FormPrimaryButton onClick={rearrangeFolders}>
          Update folders
        </FormPrimaryButton>
      </FormGroup>
      <hr />
      <FormHeading depth={2}>Remove Storage</FormHeading>
      {storage.cloudStorage != null && (
        <FormBlockquote>
          Your cloud storage will not be deleted by clicking this button. To
          delete cloud storage too, check cloud storage info section.
        </FormBlockquote>
      )}
      <FormGroup>
        <FormSecondaryButton onClick={removeCallback}>
          Remove Storage
        </FormSecondaryButton>
      </FormGroup>
      <hr />

      <FormHeading depth={2}>Cloud Storage info</FormHeading>
      {storage.cloudStorage == null ? (
        <LinkCloudStorageForm storage={storage} />
      ) : (
        <ManageCloudStorageForm storage={storage} />
      )}
    </PageContainer>
  )
}
