export interface Err<T> {
  readonly ok: false
  data: T
}

export interface Ok<T> {
  readonly ok: true
  data: T
}

export type Result<E, T> = Err<E> | Ok<T>

export function Ok<T>(data: T): Ok<T> {
  return { ok: true as const, data }
}

export function Err<T>(data: T): Err<T> {
  return { ok: false as const, data }
}

export function isOk<E, T>(res: Result<E, T>): res is Ok<T> {
  return res.ok
}

export function isErr<E, T>(res: Result<E, T>): res is Err<E> {
  return !res.ok
}

export function map<E, T, U>(
  fn: (data: T) => U,
  res: Result<E, T>
): Result<E, U> {
  return isErr(res) ? res : Ok(fn(res.data))
}

export function unwrap<E, T>(res: Result<E, T>): T {
  if (isErr(res)) {
    throw Error('Attempted to unwrap an error')
  }
  return res.data
}
