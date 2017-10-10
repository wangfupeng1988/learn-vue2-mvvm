# initState

继续看`Vue.prototype._init`函数的内容，接下来讲解到`initState(vm)`这一行 ———— 本小节就为了讲清楚这一行，就够了。

`initState`定义于`./state`，找到并简化代码

```js
export function initState (vm: Component) {
    vm._watchers = []

    // 通过 vm.$options 可获取 new Vue({...}) 中配置的 data methods 等信息
    const opts = vm.$options

    // 将每个 method 都赋值到 vm 实例
    initMethods(vm, opts.methods)
    // 将所有 data 属性都代理到 vm._data ，并且 observe(data)
    initData(vm)
}
```

前两行都比较简单，不再赘述。再次强调，`vm.$options`中包含了`new Vue({...})`传递过来的所有属性，例如`vm.$options.methos`和`vm.$options.data`

## initMethods

接下来执行`initMethods(vm, opts.methods)`，先看看`initMethods`的函数定义（简化版）

```js
function initMethods (vm: Component, methods: Object) {
  for (const key in methods) {
    // 将每个 method 赋值给 mv 对象
    vm[key] = methods[key] == null ? noop : bind(methods[key], vm)  // bind(fn, ctx) 即用 ctx 作为 fn 执行时的 this
  }
}
```

`methods`定义了用户所有的事件函数，遍历`methods`然后将这些函数都绑定到`vm`上。例如，将`vm.$options.methods.clickHandle`赋值给了`vm.clickHandle`。

值得注意的是：赋值的时候，通过`bind`将函数执行时候的`this`进行了设置，都设置为`vm`。

## initData

继续，执行`initData(vm)`，看看`initData`的函数定义（简化版）

```js
export function proxy (target: Object, sourceKey: string, key: string) {
  sharedPropertyDefinition.get = function proxyGetter () {
    return this[sourceKey][key]
  }
  sharedPropertyDefinition.set = function proxySetter (val) {
    this[sourceKey][key] = val
  }
  Object.defineProperty(target, key, sharedPropertyDefinition)
}

function initData (vm: Component) {
  // 获取 data
  let data = vm.$options.data
  data = vm._data = data || {}
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
  observe(data)
}
```

上述代码中，暂时先忽略最后的`observe(data)`，本节最后我们再解释原因。

`initData`中，关键的地方就是循环所有的`data`中的属性，然后执行`proxy(vm, '_data', key)`，`proxy`函数的源码比较简单，看最后的结果就是：用`Object.defineProperty`，将`data`中的所有属性，都监听到了`_data`的属性变化中。（对于此处的用意，我目前还没有看太明白，以后清楚了再回来补充... 这里大家把代码逻辑看明白即可）

## observe

最后的`observe(data)`是一个绝对的重点！！！因此要在后面单独拿出来讲解，放在这里撑不开它。

读者还记得最开始的[流程概述](../start.md)吧？里面提到三个重点，第一个就是**响应式原理**。从这里的`observe(data)`开始，就正式进入响应式原理的讲解了，有点主角姗姗来迟的感觉。
