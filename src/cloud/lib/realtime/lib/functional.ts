export function pipe<T extends any[], R>(
  fn1: (...args: T) => R,
  ...fns: Array<(a: R) => R>
) {
  const piped = fns.reduce(
    (prevFn, nextFn) => (value: R) => nextFn(prevFn(value)),
    (value) => value
  )
  return (...args: T) => piped(fn1(...args))
}

export function prop<K extends keyof U, U>(key: K) {
  return (obj: U): U[K] => {
    return obj[key]
  }
}

export function eq(x: any) {
  return (y: any) => x === y
}

export function unity<T>(x: T) {
  return x
}
