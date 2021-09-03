import { useEffect, useMemo, useRef, useState } from 'react'
import { Doc as YDoc } from 'yjs'
import { YMap } from 'yjs/dist/src/internals'
import { Block } from '../../api/blocks'
import { isPropKey, PropKey } from '../blocks/props'

interface Actions {
  set: (key: PropKey, value: string) => void
  delete: (key: PropKey) => void
}

export function useBlockProps(
  block: Block,
  realtime: YDoc
): [Record<PropKey, string>, Actions] {
  const ymap = useRef(realtime.getMap(block.id))
  const [state, setState] = useState(() => ymapToPropMap(ymap.current))

  useEffect(() => {
    ymap.current = realtime.getMap(block.id)
    setState(ymapToPropMap(ymap.current))
    const observer = () => setState(ymapToPropMap(ymap.current))
    ymap.current.observe(observer)

    return () => ymap.current.unobserve(observer)
  }, [block.id, realtime])

  return [state, ymap.current]
}

export function useAvaliableBlockPropKeys(
  blocks: Block[],
  ydoc: YDoc
): Set<PropKey> {
  const [keys, setKeys] = useState(() =>
    getAvailableKeys(blocks.map((block) => ydoc.getMap(block.id)))
  )
  const blockIds = useMemo(() => {
    return blocks.map((block) => block.id)
  }, [blocks])

  useEffect(() => {
    const maps = blockIds.map((id) => ydoc.getMap(id))
    setKeys(getAvailableKeys(maps))
    const cb = () => {
      setKeys(getAvailableKeys(maps))
    }

    for (const map of maps) {
      map.observe(cb)
    }
    return () => {
      for (const map of maps) {
        map.unobserve(cb)
      }
    }
  }, [blockIds, ydoc])

  return keys
}

function ymapToPropMap(map: YMap<string>): Record<PropKey, string> {
  return Object.fromEntries(
    Array.from(map.entries()).filter(([key]) => isPropKey(key))
  )
}

function getAvailableKeys(maps: YMap<string>[]): Set<PropKey> {
  return new Set(
    maps.flatMap((map) => Array.from(map.keys()).filter(isPropKey))
  )
}
