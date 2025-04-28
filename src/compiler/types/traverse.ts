import { ProgramNode } from "./parser";
export interface Traverse {
    (nodes: ProgramNode[] | ProgramNode, visitor: Visitor): void;
  }
  
  export interface Visitor {
    (node: ProgramNode): void;
  }