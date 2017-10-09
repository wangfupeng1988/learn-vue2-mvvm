import { createCompilerCreator } from './create-compiler'
import { parse } from './parser/index'
import { optimize } from './optimizer'
import { generate } from './codegen/index'

// createCompilerCreator 定义于 ./create-compiler
export const createCompiler = createCompilerCreator(
    // 传入一个函数作为参数
    function baseCompile (
      template: string,
      options: CompilerOptions
    ): CompiledResult {
      // parse 定义于 ./parser/index
      // 将 html 转换为 ast （抽象语法树）
      const ast = parse(template.trim(), options)
      // optimize 定义于 ./optimizer
      // 标记 ast 中的静态节点，即不包含变量无需改变的节点
      optimize(ast, options)
      // generate 定义于 ./codegen/index
      // 返回 {render: '..render函数体..（字符串）', staticRenderFns: Array<string>}
      const code = generate(ast, options)

      // 返回 CompiledResult 格式
      return {
        ast,
        render: code.render,
        staticRenderFns: code.staticRenderFns
      }
    }
)