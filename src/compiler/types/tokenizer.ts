export interface Tokenizer {
  (input: string): Token[];
}
//specifying function interface
export type TokenType =
  | "number"
  | "keyword"
  | "whitespace"
  | "identifier"
  | "lparen"
  | "rparen"
  | "colon"
  |"indent"
  |"dedent"
  |"operator"
  |"assignment"
  | "input"
  
    ;
//    export type OperatorType =["+","-","*","/","^"]
//a token type def must be a variable tha's eihter number keyword or white space
export interface Token {
  type: TokenType;
  value: string;
  line?: number;
  char?: number;
}

export interface Matcher {
  (input: string, index: number): Token | null;
}
//specifying function interface
