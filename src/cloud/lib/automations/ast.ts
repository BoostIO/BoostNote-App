import { TypeDef, StdPrimitives, Primitive } from './types'

export type ASTNode<P extends string = never> =
  | { type: 'operation'; identifier: string; input: ASTNode<P> }
  | { type: 'reference'; identifier: string }
  | { type: 'constructor'; info: ConstructorInfo<P> }
  | {
      type: 'literal'
      def: Extract<TypeDef<P>, { type: 'primitive' }>
      value: any
    }

export type ConstructorInfo<P extends string = never> =
  | { type: 'struct'; refs: Record<string, ASTNode<P>> }
  | { type: 'record'; refs: { key: ASTNode<P>; val: ASTNode<P> }[] }
  | { type: 'array'; refs: ASTNode<P>[] }

export function OpNode<P extends string>(
  identifier: string,
  input: ASTNode<P>
): ASTNode<P> {
  return { type: 'operation', identifier, input }
}

export function RefNode<P extends string>(identifier: string): ASTNode<P> {
  return { type: 'reference', identifier }
}

export function LiteralNode<P extends string>(
  def: P | StdPrimitives,
  value: any
): ASTNode<P> {
  return { type: 'literal', def: Primitive(def), value }
}

export function StructNode<P extends string>(
  refs: Record<string, ASTNode<P>>
): ASTNode<P> {
  return { type: 'constructor', info: { type: 'struct', refs } }
}

export function RecordNode<P extends string>(
  refs: { key: ASTNode<P>; val: ASTNode<P> }[]
): ASTNode<P> {
  return { type: 'constructor', info: { type: 'record', refs } }
}

export function ArrayNode<P extends string>(refs: ASTNode<P>[]): ASTNode<P> {
  return { type: 'constructor', info: { type: 'array', refs } }
}
