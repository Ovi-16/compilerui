// import { emitter } from "./emitter";
import { tokenize } from "./tokenizer";
import { parse } from "./parser";
import { emitter } from "./emitter";
import {Runtime,TickFunction,PrintFunction} from "./types/runtime"
type Environment = {
  [key: string]: any; // Index signature for compatibility
  print: (message: string | number) => void;
};
// export const compile: Compiler = src => {
//   const tokens = tokenize(src);
//   const ast = parse(tokens);
//   const wasm = emitter(ast);
//   return wasm;
  
// };

// export const runtime: Runtime = async (src, env) => {
//   const wasm = compile(src);
//   const result: any = await WebAssembly.instantiate(wasm, {
//     env
//   });
//   return () => {
//     result.instance.exports.run();
//   };
// };
export const compiler= (src)=>{
  const tokens = tokenize(src);
  console.log(tokens)
  const ast=parse(tokens)
  console.log(ast)
  const wasm= emitter(ast)
  console.log(wasm,"check")
  return wasm 
} 
const src=`
print 3



`
// while (over<1){
//   var over=(over+1)
  // }
// var c=3
// var d=4
// var e=5
// var f=6
// var g=7
// var A=5
// var B=5
// var C=5
// var D=5
// var E=5
// var F=5
// var G=5
// var H=5 
// var I=5
// while(over<1){
//   var over=(over+1)
  
//   if (temp==2){
//     var turn=3
//     print turn
//   }else{
//     var turn=2
//     print turn
//   }

// }
// compiler(src);
// ///////////////////////////////////////////////////////////////////////////////////////////
export const runtime: (src: string) => Promise<number[]> = async (src) => {
    const wasm = compiler(src);
    const messages=[]
    const env = {
  
      print: (message: string|number) => messages.push(message),
    };
    console.log(env)
    const memory = new WebAssembly.Memory({ initial: 1 });
    
    const result: any = await WebAssembly.instantiate(wasm, {
      env: { ...env, memory }
    });
    result.instance.exports.run();
    console.log(messages)
    return messages
  };
runtime(src)
// const env = {
  
//   print: (message: string|number) => messages.push(message),
// };

// const run=async()=>{
//   const compiled=await runtime(src)
//   console.log(compiled)
// }
// // ///////////////////////////////////////////

// run();

// compiler(src)

// const logMessage=(message:string | number )=>{
//     console.log(message)
// }
// const execute=async()=>{
//     let tickFunction: TickFunction;
    
//     tickFunction =await runtime(src, {
//     print: logMessage
//   });
//     tickFunction();
// } 
// execute();



