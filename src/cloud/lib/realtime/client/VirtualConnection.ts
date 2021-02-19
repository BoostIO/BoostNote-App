import { Observable, Subscription } from 'rxjs'
import EventTarget from 'event-target-shim'
import { unity } from '../lib/functional'

export class VirtualConnection extends EventTarget implements WebSocket {
  private subscription: Subscription
  private _onopen: (ev: Event) => any = unity
  private _onclose: (ev: CloseEvent) => any = unity
  private _onmessage: (ev: MessageEvent) => any = unity
  private _onerror: (ev: Event) => any = unity

  public binaryType: BinaryType = 'arraybuffer'
  public bufferedAmount = 0
  public url = ''
  public protocol = ''
  public extensions = ''
  public readyState = WebSocket.CONNECTING
  public CONNECTING = WebSocket.CONNECTING
  public OPEN = WebSocket.OPEN
  public CLOSING = WebSocket.CLOSING
  public CLOSED = WebSocket.CLOSED

  public constructor(
    observable: Observable<Uint8Array>,
    private _send: (data: Uint8Array) => void
  ) {
    super()
    this.subscription = observable.subscribe({
      next: (data) => {
        this.dispatchEvent(new MessageEvent('message', { data }))
      },
      complete: () => {
        this.readyState = WebSocket.CLOSED
        this.dispatchEvent(new CloseEvent('close'))
      },
      error: (err) => {
        this.readyState = WebSocket.CLOSED
        this.dispatchEvent(new Event('error'))
        this.dispatchEvent(new CloseEvent('close', { reason: err.toString() }))
      },
    })
  }

  public send(data: Uint8Array) {
    if (this.readyState === WebSocket.OPEN) {
      this._send(data)
    }
  }

  public close() {
    this.readyState = WebSocket.CLOSING
    this.subscription.unsubscribe()
    this.dispatchEvent(new CloseEvent('close'))
    this.readyState = WebSocket.CLOSED
  }

  get onopen() {
    return this._onopen
  }

  set onopen(value: VirtualConnection['_onopen']) {
    this.removeEventListener('open', this._onopen)
    this._onopen = value
    this.addEventListener('open', this._onopen)
  }

  get onclose() {
    return this._onclose
  }

  set onclose(value: VirtualConnection['_onclose']) {
    this.removeEventListener('close', this._onclose as any)
    this._onclose = value
    this.addEventListener('close', this._onclose as any)
  }

  get onmessage() {
    return this._onmessage
  }

  set onmessage(value: VirtualConnection['_onmessage']) {
    this.removeEventListener('message', this._onmessage as any)
    this._onmessage = value
    this.addEventListener('message', this._onmessage as any)
  }

  get onerror() {
    return this._onmessage as (ev: Event) => any
  }

  set onerror(value: VirtualConnection['_onerror']) {
    this.removeEventListener('error', this._onerror)
    this._onerror = value
    this.addEventListener('error', this._onerror)
  }
}
