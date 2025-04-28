import { ElifStatementNode, FunctionDefinitionNode, PrintStatementNode, SelectionStatementNode, VariableDeclarationNode, WhileStatementNode } from "./types/parser";
import { ParserStep,ProgramNode,NumberLiteralNode,StatementNode,Parser,ExpressionNode ,BlockStatementNode,FunctionCallNode} from "./types/parser";
import {Token} from "./types/tokenizer";
export class ParserError extends Error {
    token: Token;
    constructor(message: string, token: Token) {
      super(message);
      this.token = token;
    }
  }
//error
  export const parse: Parser = tokens => {
    const tokenIterator = tokens[Symbol.iterator]();
    console.log(tokenIterator)
    let currentToken = tokenIterator.next().value;
  
    const eatToken = () => (currentToken = tokenIterator.next().value);
    const checkToken=(expectedValue)=>{
        if (currentToken.value!==expectedValue){
            new ParserError("Expected",expectedValue)
        }
    }
    const parseExpression: ParserStep<ExpressionNode> = () => {
      let node: ExpressionNode;
      switch (currentToken.type) {
        case "number":
          node = {
            type: "numberLiteral",
            value: Number(currentToken.value)
          };
          eatToken();
          return node;
        case "identifier":
          node={
            type:"identifier",
            value:String(currentToken.value)
          };
          eatToken();
          return node;
        case "lparen":
            eatToken();
            const leftSide=parseExpression();
            const operator=currentToken.value;
            eatToken();
            const rightSide=parseExpression();
            eatToken();
            return {
                type: "binaryExpression",
                left:leftSide, 
                right:rightSide, 
                operator
              };
        case "input":
          eatToken();
          return {
            type:"input"
          }
        default:
          
          throw new ParserError("Expected expression", currentToken);
      }
    };
    
    const parsePrintStatement: ParserStep<PrintStatementNode> = () => {
      eatToken(); // Consume 'print' keyword
      const expression = parseExpression();
      return {
        type: "printStatement",
        expression
      };
       
    };
    const parseVariableDefinition:ParserStep<VariableDeclarationNode> = () => {
        eatToken();//consume var keyword
        const name=currentToken.value
        eatToken();
        eatToken();//consume =
        return {
            type:"variableDeclaration",
            name,
            initializer:parseExpression()
        }


    }
    const parseFunctionDefinition: ParserStep<FunctionDefinitionNode> = () =>{
      eatToken(); // Consume 'def' keyword
      if (currentToken.type !== "identifier") {
        throw new ParserError("Expected function name", currentToken);
      }

      const functionName = currentToken.value;
      eatToken(); // Consume function name
      if (currentToken.type !== "lparen") {
        throw new ParserError("Expected '(', found", currentToken);
      }
      eatToken();
      // Expecting closing parenthesis
      const arguements=[]
      if (currentToken.type !== "rparen") {
        while(currentToken.type !== "rparen"){
          arguements.push(currentToken.value)
          eatToken()
          if(currentToken.type=='operator'){
            eatToken()
          }
        }
      }
      eatToken(); // Consume ')'
      // if (currentToken.type !== "colon") {
      //   throw new ParserError("Expected ':', found", currentToken);
      // }
      // eatToken(); // Consume ':'
      if (currentToken.type !== "indent") {
        throw new ParserError("Expected indentation after function definition", currentToken);
      }
      eatToken(); // Consume indent token
  
      // Parse the function body as a block
      const body = parseBlockStatement();

      return {
        type: "functionDefinition",
        name: functionName,
        arguments:arguements,
        body: body.statements,
        
      };
      }
    const parseSelectionStatement: ParserStep<SelectionStatementNode>=()=>{
        checkToken("if");
        eatToken();
        checkToken("(")
        const expression=parseExpression()
        checkToken("{")
        eatToken();
        const consequent=parseBlockStatement().statements
        var final=[];
        const alternate=[]
        while(currentToken.value=="elif"){
            // eatToken();
            // const newexpression=parseExpression()
            // const consequent=parseBlockStatement().statements
            alternate.push(parseElifStatement());

        }
        if (currentToken.value=="else"){
            eatToken();//consume "else token "
            checkToken("{")
            eatToken();//consume indent token
            final=parseBlockStatement().statements

        }
        return{
            type:"selectionStatement",
            expression,
            consequent,
            alternate,
            final
        }
        




    }
    const parseElifStatement: ParserStep<ElifStatementNode>=()=>{
        eatToken();//consume "elif"
        const expression=parseExpression();
        const consequent=parseBlockStatement().statements
        return{
            type:"elifStatement",
            expression,
            consequent

        }
    }
    const parseWhileStatement: ParserStep<WhileStatementNode>=()=>{
      eatToken();//consume "while"
      checkToken("(")
      const expression=parseExpression()
      checkToken("{")
      eatToken();
      const consequent=parseBlockStatement().statements
      return{
        type:"whileStatement",
        expression,
        consequent,
        
    }
    }
    const parseBlockStatement: ParserStep<BlockStatementNode> = () => {
      const statements: StatementNode[] = [];
      // Collect statements until the block ends
      while (currentToken && currentToken.type !== "dedent") {
        statements.push(parseStatement());
      }
      if (currentToken && currentToken.type === "dedent") {
        eatToken(); // Consume dedent
      }
      return {
        type: "blockStatement",
        statements
      };
    };
    const parseFunctionCall: ParserStep<FunctionCallNode> = () => {
      const functionName = currentToken.value;
      eatToken(); // Consume function name
      if (currentToken.type !== "lparen") {
        throw new ParserError("Expected '(', found", currentToken);
      }
      eatToken(); // Consume '('
      const arguements=[]
      // Expecting closing parenthesis
      if (currentToken.type !== "rparen") {
        while(currentToken.type !== "rparen"){
          arguements.push(currentToken.value)
          eatToken()
          if(currentToken.type=='operator'){
            eatToken()
          }
        }
        
      }
      eatToken(); // Consume ')'
  
      return {
        type: "functionCall",
        name: functionName,
        arguments:arguements
      };
    };
    const parseStatement: ParserStep<StatementNode>=()=>{
      switch(currentToken.type){
        case "keyword":
          if (currentToken.value === "print") return parsePrintStatement();
          if (currentToken.value === "def") return parseFunctionDefinition();
          if (currentToken.value==="var") return parseVariableDefinition();
          if (currentToken.value==="if") return parseSelectionStatement()
          if(currentToken.value="while") return parseWhileStatement();
          break;
        case "identifier":
          // const identifierToken=currentToken
          // eatToken()
          // if(currentToken.value==="assignment")
          return parseFunctionCall();
        }
        throw new ParserError("Unexpected token in statement", currentToken);
      };

    
   
    const nodes: StatementNode[] = [];
    while (currentToken) {
      nodes.push(parseStatement());
    }
  
    return nodes;
  };
  // const tokens=[
  //   { type: 'keyword', value: 'print', char: 0, line: 0 },
  //   { type: 'number', value: '2', char: 6, line: 0 }
  // ]
  // const ast=parse(tokens)
  