import { addMinutes } from 'date-fns'
import { isEqual, isObject } from 'lodash'
import { equals } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePrevious } from '../../../../lib/hooks'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import {
  PropData,
  Props,
  SerializedPropData,
} from '../../../interfaces/db/props'
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

          trackEvent(MixpanelActionTrackTypes.DocPropAdd, {
            propName,
            propType: newProps[propName].type,
          })

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
          const prevData = newProps[propName]
          delete newProps[propName]
          newProps[newName] = {
            ...data,
            createdAt: bodyData.createdAt,
          }

          if (propName !== newName) {
            trackEvent(MixpanelActionTrackTypes.DocPropUpdateName, {
              propName: newName,
              propType: prevData.type,
            })
          }

          if (data.type !== prevData.type) {
            trackEvent(MixpanelActionTrackTypes.DocPropUpdateType, {
              propName: newName,
              propType: data.type,
            })
          }

          if (!equals(prevData.data, data.data)) {
            trackEvent(MixpanelActionTrackTypes.DocPropUpdateValue, {
              propName: newName,
              propType: data.type,
            })
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
        if (newProps[propName] != null) {
          trackEvent(MixpanelActionTrackTypes.DocPropDelete, {
            propName,
            propType: newProps[propName].type,
          })
        }
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
  Object.entries(itemProps).forEach(([key, value]) => {
    newProps[key] = value
  })
  Object.entries(prev).forEach(([key, value]) => {
    if (typeof itemProps[key] === 'undefined') {
      newProps[key] = {
        ...value,
        data: null,
      } as SerializedPropData
    }
  })

  parentTableColumns.forEach((propertyCol) => {
    if (isStaticPropCol(propertyCol) || newProps[propertyCol.name] != null) {
      return
    }

    const [_id, _name, type, subType] = propertyCol.id.split(':')
    newProps[propertyCol.name] = Object.assign(
      {},
      {
        origin: 'parent',
        data: type === 'json' ? { dataType: subType, data: null } : null,
        type: type,
        name: propertyCol.name,
        createdAt: addMinutes(new Date(), 2).toISOString(),
      }
    ) as any
  })
  return newProps
}
