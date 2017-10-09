import { createCompileToFunctionFn } from './to-function'

export function createCompilerCreator (baseCompile: Function): Function {
  // 传入一个函数参数 baseCompile ，最终返回一个函数
  return function createCompiler (baseOptions: CompilerOptions) {
    
    // 定义 compile 函数
    function compile (
      template: string,
      options?: CompilerOptions
    ): CompiledResult {
      // baseCompile 是传递过来的函数，最终返回值格式 {ast, render, staticRenderFns}
      const compiled = baseCompile(template, finalOptions)
      return compiled
    }

    // 返回
    return {
      compile,
      compileToFunctions: createCompileToFunctionFn(compile)
    }
  }
}