import * as Redux from 'redux'

export namespace TypedRedux {
  export interface PayloadlessAction<ACTION_TYPE extends string> extends Redux.Action {
    type: ACTION_TYPE
  }

  export interface Action <ACTION_TYPE extends string, PAYLOAD> extends PayloadlessAction<ACTION_TYPE> {
    payload: PAYLOAD
  }

  export function createActionCreator <ACTION extends Action<ACTION['type'], ACTION['payload']>>(type: ACTION['type']): (payload: ACTION['payload']) => ACTION
  export function createActionCreator <ACTION extends PayloadlessAction<ACTION['type']>>(type: ACTION['type']): () => ACTION
  export function createActionCreator <ACTION extends Action<ACTION['type'], ACTION['payload']>>(type: ACTION['type']): (payload?: ACTION['payload']) => ACTION {
    return (payload) => {
      if (payload == null) {
        return ({
          type,
        } as ACTION)
      }
      return ({
        type,
        payload,
      } as ACTION)
    }
  }
}
