import { isEqual, isObject } from 'lodash'
import { equals } from 'ramda'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { usePrevious } from '../../../../lib/hooks'
import { trackEvent } from '../../../api/track'
import { MixpanelActionTrackTypes } from '../../../interfaces/analytics/mixpanel'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { Props, SerializedPropData } from '../../../interfaces/db/props'
import {
  getDomainOrInitialDataPropToPropData,
  getPropsOfItem,
} from '../../props'
import { useCloudApi } from '../useCloudApi'

export function useProps(
  itemProps: Props,
  parent: { type: 'doc'; target: SerializedDocWithSupplemental }
) {
  const previousProps = usePrevious(itemProps)
  const [props, setProps] =
    useState<Record<string, SerializedPropData>>(itemProps)
  const { updateDocPropsApi, updateBulkDocPropsApi } = useCloudApi()

  useEffect(() => {
    if (previousProps && !isEqual(previousProps, itemProps)) {
      setProps((prev) => {
        const newProps = Object.assign({}, prev)
        Object.entries(itemProps).forEach((prop) => {
          newProps[prop[0]] = prop[1]
        })
        Object.entries(prev).forEach((prop) => {
          if (typeof itemProps[prop[0]] === 'undefined') {
            newProps[prop[0]] = Object.assign({}, prop[1], { data: null })
          }
        })
        return newProps
      })
    }
  }, [itemProps, previousProps])

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
                ? { type: data.type, subType: data.subType, data: data.data }
                : { type: data.type, subType: data.subType, data: null },
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
            propSubType: newProps[propName].subType,
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
