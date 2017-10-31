/**
 * Virtual DOM patching algorithm based on Snabbdom by
 * Simon Friis Vindum (@paldepind)
 * Licensed under the MIT License
 * https://github.com/paldepind/snabbdom/blob/master/LICENSE
 *
 * modified by Evan You (@yyx990803)  // 借鉴了 Snabbdom 并自己修改了
 */

export function createPatchFunction (backend) {

    // 创建空元素
    function emptyNodeAt (elm) {
        return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
    }

    function insert (parent, elm, ref) {
      if (isDef(parent)) {
        if (isDef(ref)) {
          if (ref.parentNode === parent) {
            nodeOps.insertBefore(parent, elm, ref)
          }
        } else {
          nodeOps.appendChild(parent, elm)
        }
      }
    }

    // 创建子元素
    function createChildren (vnode, children) {
      if (Array.isArray(children)) {
        for (let i = 0; i < children.length; ++i) {
          createElm(children[i])
        }
      } else if (isPrimitive(vnode.text)) {
        nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(vnode.text))
      }
    }
    
    // 创建元素
    function createElm (vnode) {
        const data = vnode.data
        const children = vnode.children
        const tag = vnode.tag

        if (isDef(tag)) {
            vnode.elm = nodeOps.createElement(tag, vnode)
            createChildren(vnode, children)
            insert(parentElm, vnode.elm, refElm)
        }
        } else if (isTrue(vnode.isComment)) {
          vnode.elm = nodeOps.createComment(vnode.text)
          insert(parentElm, vnode.elm, refElm)
        } else {
          vnode.elm = nodeOps.createTextNode(vnode.text)
          insert(parentElm, vnode.elm, refElm)
        }
    }

    function updateChildren (parentElm, oldCh, newCh) {
        // 源码中处理逻辑较复杂，可通过图示解释
    }

    // patch existing root node
    function patchVnode (oldVnode, vnode) {
        if (oldVnode === vnode) {
          return
        }
        const oldCh = oldVnode.children
        const ch = vnode.children

        // 源码中处理逻辑较复杂，其中最重要的就是 updateChildren 方法
        updateChildren(elm, oldCh, ch)
    }

    // vdom diff 的核心算法
    return function patch (oldVnode, vnode) {
        if (isUndef(oldVnode)) {
            // 依据当前 vnode 创建元素
            createElm(vnode)
        } else {
            // oldVnode 是否是 html 元素
            const isRealElement = isDef(oldVnode.nodeType)
            if (!isRealElement && sameVnode(oldVnode, vnode)) { // oldVnode 和 vnode 是一个节点的话
                // patch existing root node
                patchVnode(oldVnode, vnode)
            } else {
                if (isRealElement) { // oldVnode 是 html 元素
                    // 依据 html 元素创建一个空 vnode 对象（ vnode 中只有一个 tag 其他都是空的 ）
                    oldVnode = emptyNodeAt(oldVnode)
                }
                // 获取父元素
                const oldElm = oldVnode.elm
                const parentElm = nodeOps.parentNode(oldElm)

                // 依据当前 vnode 创建元素
                createElm(vnode)

                if (isDef(parentElm)) {
                  removeVnodes(parentElm, [oldVnode], 0, 0)
                }
            }
        }
        return vnode.elm
    }
}