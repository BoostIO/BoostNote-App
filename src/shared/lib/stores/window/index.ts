import { useState, useCallback, useEffect } from 'react'
import { createStoreContext } from '../../utils/context'
import { useEffectOnce } from 'react-use'
import { WindowContext } from './types'
export * from './types'

function useWindowStore(): WindowContext {
  const [windowSize, setWindowSize] = useState({ width: 200, height: 200 })

  useEffectOnce(() => {
    resizeHandler()
  })

  const resizeHandler = useCallback(() => {
    setWindowSize({
      width:
        window.innerWidth ||
        innerWidth ||
        document.documentElement.clientWidth ||
        document.body.clientWidth,
      height:
        window.innerHeight ||
        innerHeight ||
        document.documentElement.clientHeight ||
        document.body.clientHeight,
    })
  }, [])

  useEffect(() => {
    window.addEventListener('resize', resizeHandler)

    return () => {
      window.removeEventListener('resize', resizeHandler)
    }
  }, [resizeHandler])

  return {
    windowSize,
  }
}

export const {
  StoreProvider: V2WindowProvider,
  useStore: useWindow,
} = createStoreContext(useWindowStore, 'window')
