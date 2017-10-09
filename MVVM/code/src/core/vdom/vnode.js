export const createEmptyVNode = (text: string = '') => {
  // VNode 定义于本文件中
  const node = new VNode()
  node.text = text
  node.isComment = true
  return node
}

export default class VNode {
  constructor (
    tag?: string,
    data?: VNodeData,
    children?: ?Array<VNode>
  ) {
    this.tag = tag
    this.data = data
    this.children = children
  }
}