type BackOff = (iter: number, previous: number) => number | null
type TypeGuard<T> = (input: any) => input is T

export const sleep = (milliseconds: number) =>
  new Promise(r => setTimeout(r, milliseconds))

export const sleepSeconds = (seconds: number) => sleep(seconds * 1000)

export const retry = <T, A, U>(
  backOff: BackOff,
  isComplete: TypeGuard<U>,
  action: (...args: A[]) => Promise<T>
) => {
  let count = 0
  let wait = 0
  const func = async (..._args: A[]): Promise<U> => {
    const nextWait = backOff(count++, wait)
    if (nextWait === null) {
      return Promise.reject('timeout')
    }
    wait = nextWait
    await sleepSeconds(wait)
    const response = await action(..._args)

    if (isComplete(response)) {
      return response
    }

    return func(..._args)
  }
  return func
}
