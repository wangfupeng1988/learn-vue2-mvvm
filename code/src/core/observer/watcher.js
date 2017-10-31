import { queueWatcher } from './scheduler'
import Dep, { pushTarget, popTarget } from './dep'

export default class Watcher {
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function,
    options?: Object
  ) {
    this.vm = vm
    // vm._watchers 在 initState 时候赋值为 []
    vm._watchers.push(this)

    this.cb = cb
    this.deps = []
    this.newDeps = []
    this.depIds = new Set()
    this.newDepIds = new Set()

    // 传入的函数，赋值给 this.geter
    this.getter = expOrFn

    // 执行 get() 方法
    this.value = this.get()
  }

  get () {
    // 将 this （即 Wathcer 示例）给全局的 Dep.target
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // this.getter 即 new Watcher(...) 传入的第二个参数 expOrFn
      // 这一步，即顺便执行了 expOrFn
      value = this.getter.call(vm, vm)
    } catch (e) {
      // ...
    } finally {
      popTarget()
    }
    return value
  }

  /**
   * Add a dependency to this directive.
   */
  // 在 defineReactive 的 getter 中触发
  addDep (dep: Dep) {
    const id = dep.id
    if (!this.newDepIds.has(id)) {
      this.newDepIds.add(id)
      this.newDeps.push(dep)
      if (!this.depIds.has(id)) {
        // 将 this （即 Watcher 实例）添加到 dep.subs 中
        dep.addSub(this)  // 即 this.subs.push(sub)
      }
    }
  }

  // dep.subs[i].notify() 会执行到这里
  update () {
    // 异步处理 Watcher
    // queueWatcher 异步调用了 run() 方法，因为：如果一次性更新多个属性，无需每个都 update 一遍，异步就解决了这个问题
    queueWatcher(this)
  }

  run () {
    // 执行 get ，即执行 this.getter.call(vm, vm) ，即执行 expOrFn
    this.get()
  }
}