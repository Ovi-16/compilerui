export interface Runtime {
    (src: string): number[];
  }
  
export interface TickFunction {
    (): void;
  }
  
export interface Environment {
    print: PrintFunction;
  }
  
export interface PrintFunction {
    (output: string | number): void;
  }
  