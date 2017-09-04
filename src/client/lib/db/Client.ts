import * as levelup from 'levelup'
import * as levelJS from 'level-js'
import { Constructor as LevelDownConstructor } from 'leveldown'

export interface ClientOptions {
  db: LevelDownConstructor
}

const defaultOptions: ClientOptions = {
  db: levelJS
}

class Client <V = {}> {
  public db: levelup.LevelUp
  constructor (name: string, {db}: ClientOptions = defaultOptions) {
    this.db = levelup(name, {
      db
    })
  }

  public async get (key: string): Promise<V> {
    return new Promise<V>((resolve, reject) => {
      this.db.get(key, (error, value) => {
        if (error) {
          if (error.name === 'NotFoundError') {
            resolve(undefined)
          } else {
            reject(error)
          }
        } else {
          resolve(JSON.parse(value))
        }
      })
    })
  }

  public async put (key: string, value: V): Promise<{}> {
    return new Promise<V>((resolve, reject) => {
      this.db.put(key, JSON.stringify(value), (error) => {
        if (error) return reject(error)
        resolve()
      })
    })
  }

  public async delete (key: string): Promise<{}> {
    return new Promise((resolve, reject) => {
      this.db.del(key, (error) => {
        if (error) return reject(error)
        resolve()
      })
    })
  }

  public async getAlldocs (): Promise<Map<string, V>> {
    return new Promise<Map<string, V>>((resolve, reject) => {
      const map: Map<string, V> = new Map()
      const readStream: NodeJS.ReadableStream = this.db.createReadStream()
      readStream
        .on('data', (data: {key: string, value: any}) => {
          console.log('data', data)
          map.set(data.key, JSON.parse(data.value) as V)
        })
        .on('error', (error: Error) => {
          console.log('err')
          reject(error)
        })
        .on('end', () => {
          console.log('end')
          resolve(map)
        })
        .on('close', () => {
          console.log('close')
        })
    })
  }
}

export default Client
