import { useCallback, useEffect, useMemo, useState } from 'react'
import { SerializedDocWithSupplemental } from '../../../interfaces/db/doc'
import { NullablePropData, Props } from '../../../interfaces/db/props'
import { getPropsOfItem } from '../../props'
import { useCloudApi } from '../useCloudApi'

export function useProps(
  itemProps: Props,
  parent: { type: 'doc'; target: SerializedDocWithSupplemental }
) {
  const [props, setProps] = useState<Record<string, NullablePropData>>(
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
      if (a[0] > b[0]) {
        return 1
      } else {
        return -1
      }
    })
  }, [props])

  const updateProp = useCallback((propName: string, data: NullablePropData) => {
    setProps((prev) => {
      const newProps = Object.assign({}, prev)
      if (newProps[propName] == null) {
        newProps[propName] = data
      }
      return newProps
    })
  }, [])

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
