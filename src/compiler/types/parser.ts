import { Tokenizer, Token, TokenType, Matcher } from './tokenizer';

export interface Parser {
    (tokens: Token[]): Program;
  }
  
  export interface ProgramNode {
    type: string;
  }
  
  // in future we will have multiple expression types, for now
  // just number literals
  export type ExpressionNode = NumberLiteralNode|IdentifierNode|BinaryExpressionNode|InputNode;
  type Operator = "+" | "-" | "/" | "*" | "==" | ">" | "<" | "&&" | "||" | "!" | "<=" | ">="|"!="|"^";
  // in future we will have multiple statement export types, for now
  // just print statements
  export type StatementNode = PrintStatementNode|FunctionDefinitionNode|FunctionCallNode|VariableDeclarationNode|SelectionStatementNode|ElifStatementNode|WhileStatementNode;
  
  export type Program = StatementNode[];
  
  export interface NumberLiteralNode extends ProgramNode {
    type: "numberLiteral";
    value: number;
  }
  export interface InputNode extends ProgramNode{
    type:"input"
    
  }
  export interface IdentifierNode extends ProgramNode {
    type: "identifier";
    value: string;
  }
  export interface SelectionStatementNode extends ProgramNode{
    type:"selectionStatement";
    expression: ExpressionNode;
    consequent:StatementNode[];
    alternate:ElifStatementNode[];
    final:StatementNode[];
  }
  export interface WhileStatementNode extends ProgramNode{
   
    type:"whileStatement";
    expression: ExpressionNode;
    consequent:StatementNode[];
    
  }
  export interface ElifStatementNode extends ProgramNode{
    type:"elifStatement";
    expression:ExpressionNode;
    consequent:StatementNode[];
  }
  export interface PrintStatementNode extends ProgramNode {
    type: "printStatement";
    expression: ExpressionNode;
  }
  export interface FunctionDefinitionNode extends ProgramNode{
    type: "functionDefinition";
    
    name:string;
    arguments:String[];
    body:StatementNode[];
  }
  export interface VariableDeclarationNode extends ProgramNode{
    type: "variableDeclaration";
    name:string;
    initializer:ExpressionNode;
  }
  export interface FunctionCallNode extends ProgramNode{
    type: "functionCall";
    name:string;
    arguments:ExpressionNode[];
    
  }

  export interface BlockStatementNode extends ProgramNode{
    type:"blockStatement";
    statements:StatementNode[];
  }
  export interface BinaryExpressionNode extends ProgramNode{
    type:"binaryExpression";
    left: ExpressionNode;
    right: ExpressionNode;
    operator: Operator;

  }
  
  //must return a particular subclass of program node 
  export interface ParserStep<T extends ProgramNode> {
    (): T;
  }
  