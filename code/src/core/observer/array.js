/*
 * not type checking this file because flow doesn't play well with
 * dynamically accessing methods on Array prototype
 */

import { def } from '../util/index'

const arrayProto = Array.prototype
export const arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */
;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
    // 原始的方法，如 Array.prototype.push
    const original = arrayProto[method]

    // 将 arrayMethods（export出去的） 的方法重写
    def(arrayMethods, method, function mutator (...args) {
        // 用原生函数执行，获取结果
        const result = original.apply(this, args)
        // this 即被 observe 的对象，即当前的数组
        const ob = this.__ob__
        // 记录即将新增到数组中的元素
        let inserted
        switch (method) {
          case 'push':
          case 'unshift':
            inserted = args
            break
          case 'splice':
            inserted = args.slice(2)
            break
        }
        // 有新元素加入数组，也要被及时 observe
        if (inserted) ob.observeArray(inserted)

        // notify change
        ob.dep.notify()

        return result
    })
})