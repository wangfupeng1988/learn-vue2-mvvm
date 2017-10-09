import { observe } from '../observer/index'

// 代理方法
export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function initMethods (vm: Component, methods: Object) {
  for (const key in methods) {
    // 将每个 method 赋值给 mv 对象
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)  // bind(fn, ctx) 即用 ctx 作为 fn 执行时的 this
  }
}

function initData (vm: Component) {
  // 获取 data
  let data = vm.$options.data
  data = vm._data = typeof data === 'function'
    ? getData(data, vm)
    : data || {}
  // 获取 data 的 key
  const keys = Object.keys(data)

  // 遍历所有的 data
  let i = keys.length
  while (i--) {
    const key = keys[i]
    // 代理到 vm._data
    proxy(vm, `_data`, key)
  }

  // 监听 data ，重点重点重点！！！
  observe(data, true /* asRootData */)
}

export function initState (vm: Component) {
    vm._watchers = []

    // 通过 vm.$options 可获取 new Vue({...}) 中配置的 data methods 等信息
    const opts = vm.$options

    // 将每个 method 都赋值到 vm 实例
    initMethods(vm, opts.methods)
    // 将所有 data 属性都代理到 vm._data ，并且 observe(data)
    initData(vm)
}