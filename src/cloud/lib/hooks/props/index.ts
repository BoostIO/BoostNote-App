import { isObject } from 'lodash'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { Props, SerializedPropData } from '../../../interfaces/db/props'
import { getPropsOfItem } from '../../props'
import { useCloudApi } from '../useCloudApi'

export function useProps(
  itemProps: Props,
  parent: { type: 'doc'; target: SerializedDocWithSupplemental }
) {
  const [props, setProps] = useState<Record<string, SerializedPropData>>(
    itemProps
  )
  const { updateDocPropsApi } = useCloudApi()

  useEffect(() => {
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
  }, [itemProps])

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
    isPropPresent,
  }
}
