import Dep from './dep'
import { arrayMethods } from './array'

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 */
export class Observer {
  value: any;
  dep: Dep;

  constructor (value: any) {
    this.value = value
    // 新建 Dep 对象
    this.dep = new Dep()

    // 一个 value 一旦创建 observer 示例，即记录下来，无需重复创建
    def(value, '__ob__', this)

    if (Array.isArray(value)) {
      // 数组
      const augment = protoAugment
      // 将数组 value 的 prototype 重写，以便数组更新时能监控到
      augment(value, arrayMethods, arrayKeys)
      // 监听数组
      this.observeArray(value)
    } else {
      // 普通对象
      this.walk(value)
    }
  }

  /**
   * Walk through each property and convert them into
   * getter/setters. This method should only be called when
   * value type is Object.
   */
  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      // defineProperty
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

  /**
   * Observe a list of Array items.
   */
  observeArray (items: Array<any>) {
    for (let i = 0, l = items.length; i < l; i++) {
      observe(items[i])
    }
  }
}

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 */
function protoAugment (target, src: Object, keys: any) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}