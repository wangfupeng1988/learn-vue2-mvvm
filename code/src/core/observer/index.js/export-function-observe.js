/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 */
export function observe (value: any, asRootData: ?boolean): Observer | void {
    // 最初从 initData 进来的时候，value 即 new Vue(...) 配置的 data 属性
    // 后续递归的时候，可能是 data 的各个属性或者子属性

    if (!isObject(value)) {
      // value 必须是对象
      return
    }
    let ob
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        // 已有的，就直接返回
        ob = value.__ob__
    } else {
        // 创建一个新的（其中会把创建的示例绑定到 value.__ob__ 上）
        ob = new Observer(value)
    }
    return ob
}