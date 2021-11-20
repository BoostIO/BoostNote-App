import { addMinutes } from 'date-fns'
import { isEqual, isObject } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePrevious } from '../../../../lib/hooks'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { Props, SerializedPropData } from '../../../interfaces/db/props'
import {
  getDomainOrInitialDataPropToPropData,
  getPropsOfItem,
} from '../../props'
import { Column, isStaticPropCol } from '../../views/table'
import { useCloudApi } from '../useCloudApi'

export function useProps(
  itemProps: Props,
  parentTableColumns: Column[],
  parent: { type: 'doc'; target: SerializedDocWithSupplemental }
) {
  const previousProps = usePrevious(itemProps)
  const previousColumns = usePrevious(parentTableColumns)
  const [props, setProps] = useState<Record<string, SerializedPropData>>(
    getPropsFromItemAndParent({}, itemProps, parentTableColumns)
  )
  const { updateDocPropsApi, updateBulkDocPropsApi } = useCloudApi()

  useEffect(() => {
    if (
      (previousProps && !isEqual(previousProps, itemProps)) ||
      (previousColumns && !isEqual(previousColumns, parentTableColumns))
    ) {
      setProps((prev) => {
        return getPropsFromItemAndParent(prev, itemProps, parentTableColumns)
      })
    }
  }, [itemProps, previousProps, parentTableColumns, previousColumns])

  const orderedProps = useMemo(() => {
    return Object.entries(getPropsOfItem(props)).sort((a, b) => {
      if (a[1].data.createdAt > b[1].data.createdAt) {
        return 1
      } else {
        return -1
      }
    })
  }, [props])

  const updateProp = useCallback(
    (propName: string, data: SerializedPropData) => {
      setProps((prev) => {
        const newProps = Object.assign({}, prev)
        if (newProps[propName] == null) {
          newProps[propName] = data

          if (parent.type === 'doc') {
            updateDocPropsApi(parent.target, [
              propName,
              isObject(data.data)
                ? { type: data.type, data: data.data }
                : { type: data.type, data: null },
            ])
          }
        }
        return newProps
      })
    },
    [updateDocPropsApi, parent]
  )

  const modifyProp = useCallback(
    (propName: string, newName: string, data: SerializedPropData) => {
      setProps((prev) => {
        const newProps = Object.assign({}, prev)
        if (newProps[propName] != null) {
          const bodyData = {
            ...getDomainOrInitialDataPropToPropData(data),
            createdAt: newProps[propName].createdAt,
          }
          delete newProps[propName]
          newProps[newName] = {
            ...data,
            createdAt: bodyData.createdAt,
          }

          if (parent.type === 'doc') {
            if (propName !== newName) {
              updateBulkDocPropsApi(parent.target, [
                [propName, null],
                [newName, bodyData],
              ])
            } else {
              updateDocPropsApi(parent.target, [newName, bodyData])
            }
          }
        }
        return newProps
      })
    },
    [updateDocPropsApi, updateBulkDocPropsApi, parent]
  )

  const removeProp = useCallback(
    async (propName: string) => {
      setProps((prev) => {
        const newProps = Object.assign({}, prev)
        delete newProps[propName]
        return newProps
      })

      if (parent.type === 'doc') {
        updateDocPropsApi(parent.target, [propName, null])
      }
    },
    [updateDocPropsApi, parent]
  )

  const isPropPresent = useCallback(
    (propName: string) => {
      return typeof props[propName] !== 'undefined'
    },
    [props]
  )

  return {
    props: orderedProps,
    updateProp,
    removeProp,
    modifyProp,
    isPropPresent,
  }
}

function getPropsFromItemAndParent(
  prev: Record<string, SerializedPropData>,
  itemProps: Props,
  parentTableColumns: Column[]
) {
  const newProps = Object.assign({}, prev)
  Object.entries(itemProps).forEach((prop) => {
    newProps[prop[0]] = prop[1]
  })
  Object.entries(prev).forEach((prop) => {
    if (typeof itemProps[prop[0]] === 'undefined') {
      newProps[prop[0]] = Object.assign({}, prop[1], { data: null })
    }
  })

  parentTableColumns.forEach((propertyCol) => {
    if (isStaticPropCol(propertyCol) || newProps[propertyCol.name] != null) {
      return
    }

    const [_id, _name, type, _subType] = propertyCol.id.split(':')
    newProps[propertyCol.name] = Object.assign(
      {},
      {
        data: null,
        type: type,
        name: propertyCol.name,
        createdAt: addMinutes(new Date(), 2),
      }
    ) as any
  })
  return newProps
}
