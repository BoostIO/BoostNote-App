import { ASTNode } from './ast'
import { TypeDef } from './types'

export type BoostPrimitives = 'folder' | 'propData' | 'propDataType'
export type BoostType = TypeDef<BoostPrimitives>
export type BoostAST = ASTNode<BoostPrimitives>
export type PipeEntry = Extract<BoostAST, { type: 'operation' }>
