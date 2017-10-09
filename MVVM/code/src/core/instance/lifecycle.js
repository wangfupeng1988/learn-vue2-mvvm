import { createEmptyVNode } from '../vdom/vnode'
import Watcher from '../observer/watcher'

export function callHook (vm: Component, hook: string) {
  // vm.$options[hook] 可获取一开始 new Vue({...}) 中配置的钩子函数
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(vm)
    }
  }
}

export function initLifecycle (vm: Component) {
  vm.$parent = parent
  vm.$root = parent ? parent.$root : vm

  vm.$children = []
  vm.$refs = {}

  vm._watcher = null
  vm._inactive = null
  vm._directInactive = false
  vm._isMounted = false
  vm._isDestroyed = false
  vm._isBeingDestroyed = false
}

export function lifecycleMixin (Vue: Class<Component>) {
  Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {
    const prevVnode = vm._vnode
    vm._vnode = vnode
    // Vue.prototype.__patch__ is injected in entry points
    // based on the rendering backend used.
    if (!prevVnode) {
      // initial render
      vm.$el = vm.__patch__(vm.$el, vnode)
    } else {
      // updates
      vm.$el = vm.__patch__(prevVnode, vnode)
    }
  }
}

export function mountComponent (
  vm: Component,
  el: ?Element,
  hydrating?: boolean
): Component {
    if (!vm.$options.render) {
        // createEmptyVNode 定义于 ../vdom/vnode ，一个函数，用于创建一个空白的虚拟 DOM 节点
        // 赋值给 vm.$options.render
        vm.$options.render = createEmptyVNode
    }
    
    // callHook 在本文件定义，触发某个时机的钩子函数
    callHook(vm, 'beforeMount')

    let updateComponent = () => {
      // _update 定义于本文件 lifecycleMixin 中
      // _render 定义于 ./render.js _render 中，vm._render() 返回一个 vnode
      vm._update(vm._render(), hydrating)
    }
    
    // Watcher 定义于 ../observer/watcher
    vm._watcher = new Watcher(vm, updateComponent, noop)
    
    if (vm.$vnode == null) {
      vm._isMounted = true
      callHook(vm, 'mounted')
    }

    return vm;
}