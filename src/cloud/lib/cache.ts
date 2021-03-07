import { openDB } from 'idb'

type Storable = string | number | Date | ArrayBufferView | ArrayBuffer

export interface Cache<T extends Storable> {
  name: string
  get(key: string): Promise<T>
  put(key: string, value: T): Promise<void>
  close(): void
}

export interface CacheConfig {
  db_name?: string
  max_object_count?: number
}

export async function createCache<T extends Storable>(
  store_name: string,
  { db_name = 'kvcache', max_object_count = 10 }: CacheConfig = {}
): Promise<Cache<T>> {
  const db = await openDB(db_name, 1, {
    upgrade: (db) => {
      const store = db.createObjectStore(store_name)
      store.createIndex('timestamp', 'timestamp', { unique: false })
    },
  })

  return {
    name: store_name,
    get: async (key) => {
      const object = await db.get(store_name, key)
      return object != null ? object.data : undefined
    },
    put: async (key, val) => {
      const transaction = db.transaction(store_name, 'readwrite')
      const count = await transaction.store.count()
      if (count > max_object_count) {
        const cursor = await transaction.store.index('timestamp').openCursor()
        if (cursor != null) {
          for (let i = 0; i < count - max_object_count; i++) {
            await cursor.delete()
            await cursor.continue()
          }
        }
      }

      await transaction.store.put(
        {
          timestamp: Date.now(),
          data: val,
        },
        key
      )
      await transaction.done
    },
    close: () => db.close(),
  }
}
