import Dep from './dep'

export function defineReactive (
  obj: Object,
  key: string,
  val: any
) {
    // 每次执行 defineReactive 都会创建一个 dep ，它会一直存在于闭包中
    const dep = new Dep()

    // cater for pre-defined getter/setters
    const property = Object.getOwnPropertyDescriptor(obj, key)
    const getter = property && property.get
    const setter = property && property.set

    // 递归子节点，observe 即本文件定义
    let childOb = observe(val)

    Object.defineProperty(obj, key, {
        enumerable: true,
        configurable: true,

        // 注意：vm 的 data 中的属性，只有触发这里的 getter 才能绑定 dep
        // 在 mount 的时候，执行了 render 函数，而 render 函数需要获取 vm.xxx 渲染视图
        // 此前已经将 data 中的属性都 proxy 到了 vm 对象，并且又有 defineProperty 的定义
        // 因此执行 render 函数，就能触发这里的 getter ，也就绑定了 dep
        get: function reactiveGetter () {
            const value = getter ? getter.call(obj) : val
            // Dep.target 是 mount 时候，创建 new Watcher() 时赋值的
            if (Dep.target) {

              // dep.depend() 即 Dep.target.addDep(this)
              // Dep.target 是一个 Watcher 实例，this 即当前的 dep 实例
              // 相当于把 dep 实例绑定给了 Watcher 示例
              dep.depend()

              if (childOb) {
                // 对象子元素，绑定依赖
                childOb.dep.depend()
              }
              if (Array.isArray(value)) {
                // 数组，绑定依赖
                dependArray(value)
              }
            }
            // 返回值
            return value
        },
        set: function reactiveSetter (newVal) {
            const value = getter ? getter.call(obj) : val
            if (newVal === value || (newVal !== newVal && value !== value)) {
              return
            }
            if (setter) {
              setter.call(obj, newVal)
            } else {
              val = newVal
            }
            // 重新 observe
            childOb = observe(newVal)
            // 触发通知
            dep.notify()
        }
    })
}

/**
 * Collect dependencies on array elements when the array is touched, since
 * we cannot intercept array element access like property getters.
 */
function dependArray (value: Array<any>) {
  for (let e, i = 0, l = value.length; i < l; i++) {
    e = value[i]
    e && e.__ob__ && e.__ob__.dep.depend()
    if (Array.isArray(e)) {
      dependArray(e)
    }
  }
}