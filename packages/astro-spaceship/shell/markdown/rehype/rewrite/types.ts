import type { Node, Parent } from 'hast'

export type RewriteFn<N extends Node = Node, P extends Parent = Parent> = (node: N, index: number, parent: P) => void;