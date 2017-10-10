# callhook

上一节讲到了`Vue.prototype._init`函数，本节我们只关注其中的一段

```js
    // 为 vm 扩展了一些属性
    initLifecycle(vm)
    // 定义 vm.$createElement 和 vm._c
    initRender(vm)
    // 触发 beforeCreate 生命周期钩子函数
    callHook(vm, 'beforeCreate')
```

## initLifecycle

`initLifecycle`定义于`./lifecyle`中，找到并将代码简化。

```js
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
```

其中给`vm`实例定义了好多乱七八糟的属性，而且大部分都是空的，目前对我们来说没啥指导性价值，一笔带过即可。

## initRender

`initRender`定义于`./render`中，找到并将代码简化。

```js
export function initRender (vm: Component) {
  // createElement 即生成一个 vnode
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}
```

定义了`vm._c`和`vm.$createElement`，还没执行就暂时先不管它。但是这里提醒一句，`vm._c`将来会有大用处。

## callHook

`callhook`定义于`./lifecyle`，找到并简化代码

```js
export function callHook (vm: Component, hook: string) {
  // vm.$options[hook] 可获取一开始 new Vue({...}) 中配置的钩子函数
  const handlers = vm.$options[hook]
  if (handlers) {
    for (let i = 0, j = handlers.length; i < j; i++) {
        handlers[i].call(vm)
    }
  }
}
```

上一节提到，通过`new Vue({...})`之后，传入的配置都被复制给了`vm.$options`了，因此通过`vm.$options[hook]`可以获取配置的钩子函数。例如`vm.$options["beforeCreate"]`就能获取用户定义于`beforeCreate`阶段的所有钩子函数。

获取了钩子函数之后，即`for`遍历执行，注意这里执行的时候用`.call(vm)`是将函数执行时`this === vm`。比较简单，不再赘述。

最后，`callhook`从名字也能看出，这是触发钩子函数执行的操作。[vue 的生命周期](https://cn.vuejs.org/v2/guide/instance.html#生命周期图示)中，不同时期都可以注册不同的钩子函数。而所有钩子函数的执行，都是通过`callhook`触发的，后面再涉及到`callhook`的内容，就不重复讲解了。
