import { TypeDef } from './types'

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
