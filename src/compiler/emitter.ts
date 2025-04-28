
import { unsignedLEB128, encodeString, ieee754,signedLEB128, } from "./encoding";
import {Program,ExpressionNode} from "./types/parser"
import {Emitter} from "./types/Emmiter"
import traverse from "./traverse";
import { encode } from "punycode";
//utilities for encoding numbers, strings, and floating-point numbers 
//WASM's required format
const flatten = (arr: any[]) => [].concat.apply([], arr);
// [1, [2, 3], [4, [5, 6]]]->[1, 2, 3, 4, [5, 6]]
// https://webassembly.github.io/spec/core/binary/modules.html#sections
enum Section {
  custom = 0,
  type = 1,
  import = 2,
  func = 3,
  table = 4,
  memory = 5,
  global = 6,
  export = 7,
  start = 8,
  element = 9,
  code = 10,
  data = 11
}
//WebAssembly (Wasm) modules are structured binary files,
// divided into sections, each with a specific purpose
//sections help organize the different components of a
// Wasm module, such as types, functions, imports, exports,
// https://webassembly.github.io/spec/core/binary/types.html
enum Valtype {
  i32 = 0x7f,
  f32 = 0x7d
}
enum Blocktype {
    void = 0x40
  }
// https://webassembly.github.io/spec/core/binary/instructions.html
enum Opcodes {
    block = 0x02,
    loop = 0x03,
    br = 0x0c,
    br_if = 0x0d,
    end = 0x0b,
    call = 0x10,
    get_local = 0x20,
    set_local = 0x21,
    i32_store_8 = 0x3a,
    i32_const = 0x41,
    f32_const = 0x43,
    i32_eqz = 0x45,
    i32_eq = 0x46,
    f32_eq = 0x5b,
    i32_ne=0x47,
    f32_ne=0x5c,
    f32_lt = 0x5d,
    f32_le = 0x5f,
    f32_gt = 0x5e,
    f32_ge = 0x60,
    i32_and = 0x71,
    i32_or = 0x72,
    //doubtful about the one below
    i32_not = 0x45,
    f32_add = 0x92,
    f32_sub = 0x93,
    f32_mul = 0x94,
    f32_div = 0x95,
    i32_trunc_f32_s = 0xa8
  }
  
  const binaryOpcode = {
    "+": Opcodes.f32_add,
    "-": Opcodes.f32_sub,
    "*": Opcodes.f32_mul,
    "/": Opcodes.f32_div,
    "==": Opcodes.f32_eq,
    "!=": Opcodes.f32_ne,
    ">": Opcodes.f32_gt,
    ">=":Opcodes.f32_ge,
    "<": Opcodes.f32_lt,
    "<=":Opcodes.f32_le,
    "&&": Opcodes.i32_and,
    "||":Opcodes.i32_or,
    "!":Opcodes.i32_not

  };
  

// http://webassembly.github.io/spec/core/binary/modules.html#export-section
enum ExportType {
  func = 0x00,
  table = 0x01,
  mem = 0x02,
  global = 0x03
}

// http://webassembly.github.io/spec/core/binary/types.html#function-types
const functionType = 0x60;

const emptyArray = 0x0;

// https://webassembly.github.io/spec/core/binary/modules.html#binary-module
const magicModuleHeader = [0x00, 0x61, 0x73, 0x6d];
const moduleVersion = [0x01, 0x00, 0x00, 0x00];

// https://webassembly.github.io/spec/core/binary/conventions.html#binary-vec
// Vectors are encoded with their length followed by their element sequence
const encodeVector = (data: any[]) => [
  unsignedLEB128(data.length),
  ...flatten(data)
];

// https://webassembly.github.io/spec/core/binary/modules.html#sections
// sections are encoded by their type followed by their vector contents
// const createSection = (sectionType: Section, data: any[]) => {
//   const sectionLength = encodeVector(data).length;
//   return [
//   sectionType,
//   ...unsignedLEB128(sectionLength), 
//   ...encodeVector(data)
// ]
// };

const createSection = (sectionType: Section, data: any[]) => [
  sectionType,
  ...encodeVector(data)
];

const encodeLocal = (count: number, type: Valtype) => [
  ...unsignedLEB128(count),
  type
];

function addFunctionDefinition(name: string, bodyInstructions: number[],argument:String[]) {
  const typeIndex = 0x00; // assuming all functions are void-void for now
  functionTable[name] = { index: functionIndex++, typeIndex };
  // console.log("Adding function:", name, "with index:", functionTable[name].index);
  // Add function index to the function section
 

  // Encode the function body for the code section
  if (argument.length>0){
    funcSectionData.push(encodeVector([0x01]));
  }else{
    funcSectionData.push(encodeVector([typeIndex]));
  }
  const functionBody = encodeVector([
      emptyArray, // locals
      ...bodyInstructions,
      Opcodes.end
  ]);
  codeSectionData.push(functionBody);
  
}
const functionTable: { [name: string]: { index: number, typeIndex: number } } = {};
  let functionIndex = 1; // Start at 1 because 0 is reserved for imports

// The sections for storing WebAssembly module data
  var funcSectionData: number[][] = [];
var codeSectionData: number[][] = [];

var symbols = new Map<string, number>();

const localIndexForSymbol = (name: string) => {
  if (!symbols.has(name)) {
    symbols.set(name, symbols.size);
  }
  return symbols.get(name);
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const codeFromAst = (ast: Program) => {
  const code: number[] = [];
  
  const emitExpression = (node: ExpressionNode) => {
    traverse(node, (node: ExpressionNode) => {
    switch (node.type) {
      case "numberLiteral":
      //   if (!Number.isInteger(node.value)) {
      //     code.push(Opcodes.f32_const);
      //     code.push(...ieee754(node.value));
      // } else if (Number.isInteger(node.value)) {
      //     code.push(Opcodes.i32_const);
      //     code.push(...signedLEB128(node.value));
      // } else {
      //     throw new Error(`Unsupported value type for numberLiteral: ${node.valueType}`);
      // }
      // break;
        code.push(Opcodes.f32_const);
        code.push(...ieee754(node.value));
        break;
      case "binaryExpression":
        code.push(binaryOpcode[node.operator]);
        break;
      case "identifier":
        code.push(Opcodes.get_local);
        code.push(...unsignedLEB128(localIndexForSymbol(node.value)));
        break;
    }
    })
  };

  ast.forEach(statement => {

    switch (statement.type) {
      case "printStatement":
        emitExpression(statement.expression);
        code.push(Opcodes.call);
        code.push(...unsignedLEB128(0));
        break;
      case "functionDefinition":
        
        
        const bodyInstructions = codeFromAst(statement.body);
        addFunctionDefinition(statement.name, bodyInstructions,statement.arguments);
        break;
      
      case "functionCall":
        const func = functionTable[statement.name];
        if (func) {
          if (statement.arguments.length > 0) {
            for (const argument of statement.arguments) {
              emitExpression(argument);
            }
          }
            code.push(Opcodes.call);
            code.push(...unsignedLEB128(func.index));
        } else {
            throw new Error(`Undefined function called: ${statement.name}`);
        }
        break;
      case "variableDeclaration":
        emitExpression(statement.initializer)
        code.push(Opcodes.set_local);
        code.push(...unsignedLEB128(localIndexForSymbol(statement.name)))
        break;
      case "selectionStatement":
        code.push(Opcodes.block);
        code.push(Blocktype.void);
        // Compute the if condition
        emitExpression(statement.expression); // e.g., evaluates `5 == 4`
        code.push(Opcodes.i32_eqz); // If condition is false, branch to else
        // Branch to else block if condition is false
        code.push(Opcodes.br_if);
        code.push(...signedLEB128(0)); // Label for else block
        // If block logic
    
        const consequent=codeFromAst(statement.consequent); // Handle the 'then' block
        

        code.push(...consequent)
      
        code.push(Opcodes.end);
        // Skip the else block after executing the if block
        code.push(Opcodes.block);
        code.push(Blocktype.void);
        emitExpression(statement.expression);
        code.push(Opcodes.i32_const);
        code.push(...signedLEB128(1));
        code.push(Opcodes.i32_eq);
        code.push(Opcodes.br_if);
        code.push(...signedLEB128(0));
        // Else block logic
        const else_block_code=codeFromAst(statement.final); 
        code.push(...else_block_code)// Handle the 'else' block
        // End the else block
        code.push(Opcodes.end);
        break;
      case "whileStatement":
        code.push(Opcodes.block);
        code.push(Blocktype.void);
        // inner loop
        code.push(Opcodes.loop);
        code.push(Blocktype.void);
        // compute the while expression
        emitExpression(statement.expression);
        code.push(Opcodes.i32_eqz);
        // br_if $label0
        code.push(Opcodes.br_if);
        code.push(...signedLEB128(1));
        // the nested logic
        const nested=codeFromAst(statement.consequent);
        code.push(...nested)
        // br $label1
        code.push(Opcodes.br);
        code.push(...signedLEB128(0));
        // end loop
        code.push(Opcodes.end);
        // end block
        code.push(Opcodes.end);

        break;
      // case "selectionStatement":
      //   let branchDepth=0
      //   code.push(Opcodes.block); // Outer block for the entire if-elif-else
      //   code.push(Blocktype.void);

      //   // 1. If block
      //   emitExpression(statement.expression); // Evaluate `if` condition
      //   code.push(Opcodes.i32_eqz); // Check if condition is false
      //   code.push(Opcodes.br_if); // Branch if false
      //   code.push(...signedLEB128(branchDepth)); // Label for skipping to next condition
      //   branchDepth++
      //   // If block logic
      //   const consequent = codeFromAst(statement.consequent); // 'if' body
      //   code.push(...consequent);
      //   code.push(Opcodes.br); // Skip remaining branches after executing 'if'
      //   code.push(...signedLEB128(branchDepth));
      //   branchDepth++
      //   for (const elifBlock of statement.alternate){
      //     code.push(Opcodes.block); // Start an elif block
      //     code.push(Blocktype.void);
      //     emitExpression(elifBlock.expression)
      //     code.push(Opcodes.i32_eqz);
      //     code.push(Opcodes.br_if);
      //     code.push(...signedLEB128(branchDepth));
      //     branchDepth++
      //     const elifConsequent = codeFromAst(elifBlock.consequent);
      //     code.push(...elifConsequent);
      //     code.push(Opcodes.br); // Skip remaining branches
      //     code.push(...signedLEB128(branchDepth));

      //     code.push(Opcodes.end); // End elif block
      //   }
      //   if (statement.final.length!=0){
      //     const else_block_code = codeFromAst(statement.final); // 'else' body
      //     code.push(...else_block_code);
      //   }
      //   code.push(Opcodes.end)
      //   break;


  }
    
  });
  
  return code;//returns list (stack)
};

export const emitter: Emitter = (ast: Program) => {
  // Function types are vectors of parameters and return types. Currently
  // WebAssembly only supports single return values
  
  const voidVoidType = [functionType, emptyArray, emptyArray];

  const floatVoidType = [
    functionType,
    ...encodeVector([Valtype.f32]),
    //represents parameters
    emptyArray
    //represents return values
  ];
  const newType=[functionType,...encodeVector([]),emptyArray]
  //encoding a new function 
  // takes a 32-bit floating-point number as an argument
  // the type section is a vector of function types
  const typeSection = createSection(
    Section.type,
    encodeVector([voidVoidType, floatVoidType,newType])
  );
  //define a sector which is of a particular section( type )
  //and a vector or list containing the function type code 
  //input parameters 
  //and return values
  //to the function and 
  
  
  
  //specifying that there is one 
  //function in the module that uses a function type defined elsewhere

  // the import section is a vector of imported functions
  //printFunctionImport 
  //array is used to define an import entry for 
  //a WebAssembly module requiring some exterenal function

  const printFunctionImport = [
    ...encodeString("env"),
    ...encodeString("print"),
    ExportType.func,//Specifies the type of the imported item.
    0x01 // is the index of the 
    //function type that the imported function must match
  ];
  const memoryImport = [
    ...encodeString("env"),
    ...encodeString("memory"),
    ExportType.mem,
    /* limits https://webassembly.github.io/spec/core/binary/types.html#limits -
      indicates a min memory size of one page */
    0x00,
    0x01
  ];

  const importSection = createSection(
    Section.import,
    encodeVector([printFunctionImport,memoryImport])
  );

  // the export section is a vector of exported functions
  //This section tells the WebAssembly runtime which external functions
  //to be provided by the environment in which it runs.
  
  //functionTable["run"].index
  //the function exposed to the external environment under a specific name ("run" in the example) is 
  //actually the function defined at index 1 in the function section.
////////////////////////////////////////////////////////////////////////////////////////////////////
// console.log(codeSectionData,"godzila")
const code= codeFromAst(ast)

const localCount = symbols.size;
// console.log(localCount,"localcount")
// console.log(...encodeVector([encodeLocal(8, Valtype.f32)]));
// console.log(...encodeVector([encodeLocal(9, Valtype.f32)]));
const locals = localCount > 0 ? [encodeLocal(localCount, Valtype.f32)] : [];
  const mainCode = encodeVector([
    ...encodeVector(locals), // No locals
    ...code, // Get the code from the AST (main program body)
    Opcodes.end
  ]);
  // console.log(codeSectionData,"godzila")
  // Create the code section by including both the main code and function bodies
  // console.log(codeSectionData)
  codeSectionData.push(mainCode); 
  // console.log("codesecdata")// Add main code as a function body
  // console.log(codeSectionData.length)
  // console.log(codeSectionData,"godzila")
  // console.log(...flatten(codeSectionData))
const codeSection = createSection(
    Section.code,
    
    encodeVector(codeSectionData)
    
);
  // const codeSection = createSection(Section.code, 
  //   encodeVector([
  //     ...mainCode, // Main program code
  //     ...flatten(codeSectionData) // Include function bodies (from codeSectionData)
  //   ])
  // );
  
  // console.log([0x00])
  // funcSectionData.push(encodeVector([0x00 /* type index */]));
  const fun = [
    encodeVector([0x00]), // Function type for the 'hello' function (e.g., void function)
    encodeVector([0x00])  // Function type for the top-level code (also void)
  ];
  // console.log(funcSectionData,"helo")
  // console.log(encodeVector([[0x00],[0x00]]))
  function createHexList(count: number): number[][] {
    return new Array(count).fill([0x00]);
  }
  //  console.log(funcSectionData.length,'god')
  //console.log(codeSectionData.length)
  const funcSection = createSection(
    Section.func, 
    funcSectionData.length===0 ? encodeVector([2]) : encodeVector(createHexList(funcSectionData.length+1))
    // funcSectionData.length===0 ? encodeVector([2]) : encodeVector([[0x01],[0x00]])
  );
  const exportSection = createSection(
    Section.export,
    encodeVector([
      [...encodeString("run"), ExportType.func,  funcSectionData.length+1 /* function index */]
    ])
  );
  codeSectionData=[]
  funcSectionData=[]
  symbols = new Map<string, number>();
 





  // // the code section contains vectors of functions
  // //This function body specifies the sequence 
  // //of instructions that will be executed when the function is called
  // const functionBody = encodeVector([
  //   emptyArray /** locals */,//define any local variables
  //   ...codeFromAst(ast),
  //   Opcodes.end
  // ]);

  // const codeSection = createSection(Section.code, 
  //   // encodeVector([functionBody])
  //   encodeVector(codeSectionData)
  // );
  // const funcSection = createSection(
  //   Section.func,//declare that it's a function section
  //   funcSectionData.length ? encodeVector(funcSectionData) : encodeVector([0x00])
  //   //encodeVector([0x00 /* type index */])//function type code
    
  // );
  // console.log(codeSectionData,funcSectionData)
  
////////////////////////////////////////////////////////////////////////////////////////////////////  
  return Uint8Array.from([
    ...magicModuleHeader,
    ...moduleVersion,
    ...typeSection,
    ...importSection,
    ...funcSection,
    ...exportSection,
    ...codeSection
  ]);
};
