/*
 * SERVER MESSAGES
 */
export enum ServerMessageType {
  Auth = 0,
  Channel = 1,
  Error = 2,
}

export enum ServerChannelMessageType {
  Subscribe = 0,
  Unsubscribe = 1,
  Push = 2,
}

export enum AuthErrors {
  Invalid = 1001,
  Expired = 1002,
  BadFormat = 1003,
}

export enum ChannelErrors {
  Forbidden = 2001,
  ServerError = 2005,
}

export interface SubscribeAcceptMessage {
  type: ServerChannelMessageType.Subscribe
  token: string
}

export interface UnsubscribeAcceptMessage {
  type: ServerChannelMessageType.Unsubscribe
  token: string
}

export interface PublishMessage {
  type: ServerChannelMessageType.Push
  path: string
  body: Uint8Array
}

export interface AuthAcceptMessage {
  type: ServerMessageType.Auth
}

export type ServerChannelMessageContent =
  | SubscribeAcceptMessage
  | UnsubscribeAcceptMessage
  | PublishMessage

export interface ServerChannelMessage {
  type: ServerMessageType.Channel
  message: ServerChannelMessageContent
}

export interface ErrorMessage {
  type: ServerMessageType.Error
  code: ChannelErrors | AuthErrors
  body: string
}

export type ServerMessage =
  | AuthAcceptMessage
  | ServerChannelMessage
  | ErrorMessage

/*
 * CLIENT MESSAGES
 */

export enum MessageType {
  Auth = 0,
  ChannelMessage = 1,
}

export enum ChannelMessageType {
  Subscribe = 0,
  Unsubscribe = 1,
  Message = 2,
}

export interface Auth {
  type: MessageType.Auth
  auth: string
}

export interface Subscribe {
  type: ChannelMessageType.Subscribe
  token: string
}

export interface Unsubscribe {
  type: ChannelMessageType.Unsubscribe
  token: string
}

export interface Message {
  type: ChannelMessageType.Message
  token: string
  message: Uint8Array
}

export type ClientChannelMessageContent = Subscribe | Unsubscribe | Message

export interface ClientChannelMessage {
  type: MessageType.ChannelMessage
  message: ClientChannelMessageContent
}

export type ClientMessage = Auth | ClientChannelMessage
