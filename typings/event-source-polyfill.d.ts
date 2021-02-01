import { OutgoingHttpHeaders } from 'http'

declare module 'event-source-polyfill' {
  interface EventSourceInitPolyfill extends EventSourceInit {
    headers?: OutgoingHttpHeaders
  }
  export const EventSourcePolyfill: {
    prototype: EventSource
    new (
      url: string,
      eventSourceInitDict?: EventSourceInitPolyfill
    ): EventSource
    readonly CLOSED: number
    readonly CONNECTING: number
    readonly OPEN: number
  }
}
