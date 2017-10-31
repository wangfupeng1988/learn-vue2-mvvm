
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initLifecycle, callHook } from './lifecycle'

export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {
    // options 即用户在 new Vue({...}) 时传入的对象

    const vm = this

    // 将所有的配置属性都混合在一起，放在 vm.$options 对象中，集中处理
    // 这里可暂时只关注将 options 中的属性
    vm.$options = mergeOptions(
      resolveConstructorOptions(vm.constructor),
      options || {},
      vm
    )

    vm._self = vm

    // 为 vm 扩展了一些属性
    initLifecycle(vm)
    // 定义 vm.$createElement 和 vm._c
    initRender(vm)
    // 触发 beforeCreate 生命周期钩子函数
    callHook(vm, 'beforeCreate')
    // observe(data)
    initState(vm)
    // 触发 created 生命周期钩子函数
    callHook(vm, 'created')

    if (vm.$options.el) {
      // 在 platforms/web/entry-runtime-with-compiler.js 中定义
      vm.$mount(vm.$options.el)
    }
  }
}