/**
 * Goal of the optimizer: walk the generated template AST tree
 * and detect sub-trees that are purely static, i.e. parts of
 * the DOM that never needs to change.
 *
 * Once we detect these sub-trees, we can:
 *
 * 1. Hoist them into constants, so that we no longer need to
 *    create fresh nodes for them on each re-render;
 * 2. Completely skip them in the patching process.
 */
export function optimize (root: ?ASTElement) {
  if (!root) return
  // first pass: mark all non-static nodes.
  // 标记所有静态节点
  markStatic(root)
  // second pass: mark static roots.
  // 找出最大的静态子树
  markStaticRoots(root)
}

// 标记静态节点
function markStatic (node: ASTNode) {
  // 获取该节点是否是 static
  node.static = isStatic(node)
  if (node.type === 1) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      const child = node.children[i]
      // 递归子节点
      markStatic(child)
      if (!child.static) {
        // 只要有一个子节点不是 static ，那么当前节点就肯定不是 static
        node.static = false
      }
    }
  }
}

// 找出最大的静态子树
function markStaticRoots (node: ASTNode) {
  if (node.type === 1) {
    if (node.static && node.children.length && !(
      // 下面两行代码如 <p>abc</p> 
      node.children.length === 1 &&
      node.children[0].type === 3
    )) {
      // 满足以下情况才能设置 staticRoor = true
      // 第一，node.static
      // 第二，node.children.length
      // 第三，不能是 <p>abc</p> 这种只有一个根节点，且根节点 type === 3
      node.staticRoot = true

      // 一旦当前节点标记为 staticRoot = true 之后，就退出，不再去深入递归子节点
      // 因为该情况下，子节点肯定都是 static 的情况
      // 这样就找到了“最大的静态子树”
      return
    } else {
      // 标记当前节点
      node.staticRoot = false
    }
    if (node.children) {
      for (let i = 0, l = node.children.length; i < l; i++) {
        // 递归子节点
        markStaticRoots(node.children[i])
      }
    }
  }
}

function isStatic (node: ASTNode): boolean {
  if (node.type === 2) { // expression
    return false
  }
  if (node.type === 3) { // text
    return true
  }
  return !!(
    !node.hasBindings && // no dynamic bindings
    !node.if && !node.for && // not v-if or v-for or v-else
  )
}