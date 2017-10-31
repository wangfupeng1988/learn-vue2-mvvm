
export function generate (
  ast: ASTElement | void,
  options: CompilerOptions
): CodegenResult {
  // 重点关注 state.staticRenderFns ，最大静态子树的渲染函数会放在其中
  const state = new CodegenState(options)
  // 根据 ast 生成的 render 函数体
  // genElement 定义于本文件中
  const code = ast ? genElement(ast, state) : '_c("div")'
  return {
    render: `with(this){return ${code}}`,
    staticRenderFns: state.staticRenderFns
  }
}

// 生成 render 函数体的代码
export function genElement (el: ASTElement, state: CodegenState): string {
  if (el.staticRoot && !el.staticProcessed) {
    return genStatic(el, state)
  } else if (el.once && !el.onceProcessed) {
    return genOnce(el, state)
  } else if (el.for && !el.forProcessed) {
    return genFor(el, state)
  } else if (el.if && !el.ifProcessed) {
    return genIf(el, state)
  } else {
    // data 是一个 stirng 化 JSON 格式，包含当前节点的所有信息
    const data = genData(el, state)
    // 返回一个数组的 string 形式，子元素的信息
    const children = genChildren(el, state, true)
    const code = `_c('${el.tag}'${  // _c 即 createElement
      data ? `,${data}` : '' // data
    }${
      children ? `,${children}` : '' // children
    })`
    return code
  }
}

// hoist static sub-trees out
function genStatic (el: ASTElement, state: CodegenState): string {
  el.staticProcessed = true
  // 用上了 state.staticRenderFns
  state.staticRenderFns.push(`with(this){return ${genElement(el, state)}}`)
  // 返回 '_m(n)' n 即是 staticRenderFns 元素的 index
  return `_m(${state.staticRenderFns.length - 1})`  // _m 即 renderStatic
}

// v-once
function genOnce (el: ASTElement, state: CodegenState): string {
  el.onceProcessed = true
  // 注意 el.onceProcessed = true 之后，执行到 genStatic
  // 会在继续执行到 genElement ，此时 onceProcessed = true 就能起到作用
  return genStatic(el, state)
}

// v-for
export function genFor (
  el: any,
  state: CodegenState
): string {
  const exp = el.for
  const alias = el.alias
  const iterator1 = el.iterator1 ? `,${el.iterator1}` : ''
  const iterator2 = el.iterator2 ? `,${el.iterator2}` : ''

  el.forProcessed = true // avoid recursion
  return `${'_l'}((${exp}),` +  /* _l 即 renderList */
    `function(${alias}${iterator1}${iterator2}){` +
      `return ${genElement(el, state)}` +
    '})'
}

export function genIf (
  el: any,
  state: CodegenState,
  altGen?: Function,
  altEmpty?: string
): string {
  el.ifProcessed = true // avoid recursion
  // ？？？？？
  return genIfConditions(el.ifConditions.slice(), state, altGen, altEmpty)
}

export function genData (el: ASTElement, state: CodegenState): string {
  let data = '{'

  // directives first.
  // directives may mutate the el's other properties before they are generated.
  const dirs = genDirectives(el, state)
  // dirs 格式如 'directives:[{name:"show",rawName:"v-show",value:(show),expression:"show"}, {...}]'
  if (dirs) data += dirs + ','

  // key
  if (el.key) {
    data += `key:${el.key},`
  }

  // attributes
  if (el.attrs) {
    data += `attrs:{${genProps(el.attrs)}},`
  }

  // event handlers
  if (el.events) {
    data += `${genHandlers(el.events, false, state.warn)},`
  }

  // component v-model
  if (el.model) {
    data += `model:{value:${
      el.model.value
    },callback:${
      el.model.callback
    },expression:${
      el.model.expression
    }},`
  }

  data = data.replace(/,$/, '') + '}'
  // 最终 data 会是一个 stirng 化 JSON 格式，包含当前节点的所有信息
  return data
}

export function genChildren (
  el: ASTElement,
  state: CodegenState
): string | void {
  const children = el.children
  if (children.length) {
    // optimize single v-for
    if (children.length === 1 && el.for) {
      // 再调用 genElement
      return genElement(el, state)
    }
    // 注意：针对 v-for 的情况，不能走正常的递归子节点的处理，需要特殊处理

    // 递归分析子节点
    return `[${children.map(c => genNode(c, state)).join(',')}]`
  }
}

function genNode (node: ASTNode, state: CodegenState): string {
  if (node.type === 1) {
    // 普通节点
    return genElement(node, state)
  } if (node.type === 3 && node.isComment) {
    // 注释
    return genComment(node)
  } else {
    // 文字
    return genText(node)
  }
}

export function genComment (comment: ASTText): string {
  return `_e(${JSON.stringify(comment.text)})`  // _e 即 createEmptyVNode
}

export function genText (text: ASTText | ASTExpression): string {
  return `_v(${text.type === 2  /* _v 即 createTextVNode */
    ? text.expression // no need for () because already wrapped in _s()
    : JSON.stringify(text.text)
  })`
}

function genDirectives (el: ASTElement, state: CodegenState): string | void {
  const dirs = el.directives
  if (!dirs) return
  let res = 'directives:['
  let i, l, dir
  for (i = 0, l = dirs.length; i < l; i++) {
    dir = dirs[i]
    res += `{name:"${dir.name}",rawName:"${dir.rawName}"${
      dir.value ? `,value:(${dir.value}),expression:${JSON.stringify(dir.value)}` : ''
    },`
  }
  // 返回 directives:[{name:"show",rawName:"v-show",value:(show),expression:"show"}, {...}] 格式
  return res.slice(0, -1) + ']'
}