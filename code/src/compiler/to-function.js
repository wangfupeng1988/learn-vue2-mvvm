
// 创建一个函数
function createFunction (code, errors) {
  return new Function(code)
}

export function createCompileToFunctionFn (compile: Function): Function {
  // 接收一个函数，返回一个函数
  return function compileToFunctions (
    template: string,
    options?: CompilerOptions,
    vm?: Component
  ): CompiledFunctionResult {
    const cache = {}
    const res = {}

    const compiled = compile(template, options)
    res.render = createFunction(compiled.render, fnGenErrors)
    res.staticRenderFns = compiled.staticRenderFns.map(code => {
      return createFunction(code, fnGenErrors)
    })

    return (cache[key] = res)
  }
}