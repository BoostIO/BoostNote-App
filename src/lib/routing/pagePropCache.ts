import { Cache, createCache } from '../../cloud/lib/cache'

let _cache: Cache<string>
async function getCache() {
  if (_cache == null) {
    _cache = await createCache('cache:page-props', {
      max_object_count: 1000,
      db_name: 'cache:page-props-db',
    })
  }
  return _cache
}

export async function cleanPageProps(pathname: string): Promise<void> {
  const cache = await getCache()
  await cache.delete(pathname)
}

export async function setCachedPageProps<T>(
  pathname: string,
  pageProps: T
): Promise<void> {
  const cache = await getCache()
  await cache.put(pathname, JSON.stringify(pageProps))
}

export async function getCachedPageProps<T>(
  pathname: string
): Promise<T | undefined> {
  const cache = await getCache()
  const rawJson = await cache.get(pathname).catch((error) => {
    if (error.name === 'NotFoundError') {
      return undefined
    }
    console.error(error, error.name)
    return undefined
  })
  if (rawJson == null) {
    return undefined
  }

  return JSON.parse(rawJson.toString()) as T
}

export async function flushPageProps() {
  const cache = await getCache()
  await cache.flush()
}
