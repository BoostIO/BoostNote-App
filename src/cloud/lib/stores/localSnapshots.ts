import { sub } from 'date-fns'
import { IDBPDatabase, openDB } from 'idb'
import { useCallback, useRef } from 'react'
import { generateId } from '../../../lib/string'

let db: IDBPDatabase<LocalSnapshot> | null = null
const dbName = 'local-snapshots'
const storeName = 'local-snapshots'

async function getDb(): Promise<IDBPDatabase<LocalSnapshot>> {
  if (db == null) {
    db = await openDB(dbName, 1, {
      upgrade: (db) => {
        const store = db.createObjectStore(storeName)
        store.createIndex('createdAt', 'createdAt', { unique: false })
        store.createIndex('docId', 'docId', { unique: false })
      },
    })
  }

  return db
}

export interface LocalSnapshot {
  id: string
  docId: string
  content: string
  createdAt: Date
  updatedAt: Date
}

interface LocalSnapshotStore {
  takeSnapshot: (docId: string, content: string) => void | Promise<void>
  listSnapshotsByDocId: (docId: string) => Promise<LocalSnapshot[]>
}

export function useLocalSnapshot(): LocalSnapshotStore {
  const lastSnapshotRef = useRef<null | LocalSnapshot>(null)
  const listSnapshotsByDocId = useCallback(async (docId: string) => {
    const db = await getDb()
    const transaction = db.transaction(storeName, 'readonly')

    const cursor = transaction.store.index('docId')
    const snapshots: LocalSnapshot[] = await cursor.getAll(docId)
    await transaction.done

    return snapshots.sort((a, b) =>
      a.createdAt > b.createdAt ? 1 : a.createdAt === b.createdAt ? 0 : -1
    )
  }, [])

  const takeSnapshot = useCallback(
    async (docId: string, content: string, interval = 300) => {
      let snapshot = lastSnapshotRef.current
      const db = await getDb()

      const transaction = db.transaction(storeName, 'readwrite')
      if (
        snapshot == null ||
        snapshot.docId !== docId ||
        snapshot.createdAt < sub(new Date(), { seconds: interval })
      ) {
        const id = generateId()
        snapshot = {
          id,
          docId,
          content,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      } else {
        snapshot.content = content
        snapshot.updatedAt = new Date()
      }
      lastSnapshotRef.current = snapshot
      await transaction.store.put(snapshot, snapshot.id)
      await transaction.done
    },
    []
  )

  return {
    takeSnapshot,
    listSnapshotsByDocId,
  }
}
