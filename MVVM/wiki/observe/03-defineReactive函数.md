# defineReactive 函数

上一节在`new Observer()`的时候，针对传入的`value`，遍历所有属性，然后执行`defineReactive(obj, keys[i], obj[keys[i]])`，本节就介绍`defineReactive`函数。

> **注意，在看本节内容之前，你首先要了解 ES5 中新增的`Object.defineProperty`这个 API ，不了解的同学应该先去查阅资料。**

`defineReactive`定义于`core/observer/index.js`文件中，简化后的代码如下

```js
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
              // 相当于把 dep 实例绑定给了 Watcher 实例
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
```

`defineReactive`执行的一开始就有`const dep = new Dep()`，`dep`会一直存在于闭包中，后面会不断用到它。还有，`let childOb = observe(val)`会递归执行`observe`（之前将`observe`时介绍过）。

然后我们直接看`get`，即属性被访问的时候的一些逻辑。`get`的最终目的肯定是获取值，最后返回值，这个在代码中体现的很清晰。我们现在关注的是中间`dep.depend()`附近的这几行。首先，`if (Dep.target) {`中`Dep`是外部引用的一个函数（后面会讲到），如果有`Dep.target`，那么就执行`dep.depend()`以及`childOb.dep.depend()`。至于这个`depend()`，我们可以先暂时不关心，只需要先简单了解到它是绑定依赖关系用的。后面会详细介绍其中的逻辑。

最后看`set`，即属性被重新赋值的时候的一些逻辑。这里最主要的就是`dep.notify()`，细节先不要管，先知道这个操作是触发绑定关系的。即我们最简单的 demo 中，改变了 Vue 示例的属性、页面中 DOM 就会变化，这就是通过这个`dep.notify()`触发的这种变化。

从`get`和`set`里面的核心逻辑可以简单看出 vue 的响应式的过程————**访问属性时绑定依赖，修改属性时触发依赖**。对，就这样。

