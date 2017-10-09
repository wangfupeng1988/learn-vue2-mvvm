# 对 Vue 的操作

上一节分析了 Vue 的定义，经历了好多个过程的跳转。这一节，我们把每一步过程倒过来，从后往前看。看看 Vue 定义出来之后，又被进行了哪些操作。

注意：根据** MVVM 核心源码**分析的原则，本节讲解的内容不会 cover 住 Vue 源码中所有的内容，而是精简之后的内容。

## `./instance/index`

简化代码之后

```js
import { initMixin } from './init'
import { renderMixin } from './render'
import { lifecycleMixin } from './lifecycle'

function Vue (options) {
    /* 暂时忽略函数体 */
}

// 定义 Vue.prototype._init
initMixin(Vue)
// 定义 Vue.prototype._update
lifecycleMixin(Vue)
// 定义 Vue.prototype._render 以及 _o _n _s 等 vdom 使用的缩写函数
renderMixin(Vue)

export default Vue
```

根据注释可以看出（打开可以分别打开`./init` `./render` `./lifecycle`的源码看一下）

- `initMixin(Vue)`定义了`Vue.prototype._init`
- `lifecycleMixin(Vue)`定义了`Vue.prototype._update`
- `renderMixin(Vue)`定义了`Vue.prototype._render` 以及 `_o` `_n` `_s` 等缩写函数

至于这些被定义的函数有何作用，现在还不用关心。我们本着一个原则去阅读源码 ———— **函数未调用时，就先不关心它有什么作用** 。现在只需要知道，这几个函数在这里被定义了，就可以了。

## `core/index`

简化代码之后，什么都没有，直接跳过。

```js
import Vue from './instance/index'
export default Vue
```

## `./runtime/index`

简化代码之后

```js
import { patch } from './patch'
import Vue from 'core/index'

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// 此处定义 $mmount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  
}
```

这里定义了`__patch__`和`$mount`两个函数，它们的作用暂时不用 care 。

## `web/entry-runtime-with-compiler.js`

简化代码之后：

```js
import Vue from './runtime/index'

// $mount 在 ./runtime/index 中定义
const mount = Vue.prototype.$mount;

// 重新定义 $mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  
}

export default Vue
```

这里又重新赋值了`$mount`函数，仅此而已。

## 总结

经过一系列的过程，其实就是为`Vue.prototype`扩展了好多属性，有

- `_init`
- `_update`
- `_render`
- `_o` `_n` `_s` 等缩写函数
- `__patch__`
- `$mount`（定义之后，又被重新赋值）

对于这些函数，读者不用记住也不用着急知道它们的作用，把本文所讲述的内容看明白就可以了。后面如果用到了这些函数，我会提醒大家来这里复查。