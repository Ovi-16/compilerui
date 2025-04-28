import {Program,ExpressionNode} from "./parser"
export interface Emitter {
    (ast: Program): Uint8Array;
  }
  