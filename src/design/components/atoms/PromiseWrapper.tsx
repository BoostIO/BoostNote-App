import React, { useCallback, useState } from 'react'
import { useEffectOnce } from 'react-use'
import styled from '../../lib/styled'
import Spinner from './Spinner'

interface PromiseWrapper<T extends Record<string, any>, P> {
  promise: () => Promise<T>
  otherProps: P
  WrappedComponent: React.ComponentType<T & P>
}

const PromiseWrapper = <
  T extends Record<string, any>,
  P extends Record<string, any>
>({
  promise: api,
  otherProps,
  WrappedComponent,
}: PromiseWrapper<T, P>) => {
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<unknown>()
  const [props, setProps] = useState<T | undefined>(undefined)

  useEffectOnce(() => {
    call().then(() => setFetching(false))
  })

  const call = useCallback(async () => {
    try {
      const data = await api()
      setProps(data)
    } catch (error) {
      setError(error)
    }
  }, [api, setProps, setError])

  useCallback(async () => {
    if (fetching) {
      return
    }
    setError(undefined)
    setFetching(true)
    await call()
    setFetching(false)
  }, [fetching, setFetching, setError, call])

  if (fetching) {
    return (
      <Container>
        <Spinner />
      </Container>
    )
  }

  if (error != null || props == null) {
    //return error block
    return <div>nothing</div>
  }

  return <WrappedComponent {...props} {...otherProps} />
}

export default PromiseWrapper

const Container = styled.div`
  display: block;
  width: 100%;
  height: auto;
  padding: ${({ theme }) => theme.sizes.spaces.sm}px
    ${({ theme }) => theme.sizes.spaces.md}px;
  text-align: center;
`
