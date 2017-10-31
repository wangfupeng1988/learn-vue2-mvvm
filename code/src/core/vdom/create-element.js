export function createElement (
  context: Component,
  tag: any,
  data: any,
  children: any
): VNode {
  // 创建一个 vnode
  return _createElement(context, tag, data, children)
}

export function _createElement (
  context: Component,
  tag?: string | Class<Component> | Function | Object,
  data?: VNodeData,
  children?: any
): VNode {

    vnode = new VNode(
      tag, data, children
    )

    return vnode
}