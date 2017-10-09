# Vue 的定义

上一节在`src/platforms/web/entry-runtime-with-compiler.js`中看到

```js
import Vue from './runtime/index'
```

继续到`./runtime/index`又发现

```js
import Vue from 'core/index'
```

继续到`core/index`（其实是`src/core/index.js`这个文件）又发现

```js
import Vue from './instance/index'
```

好吧，最后终于在`./instance/index`中找到了

```js
function Vue (options) {
    /* 省略 N 行 */
}

/* 省略 N 行 */

export default Vue
```

最后发现，`Vue` 就是一个函数（构造函数），经历了这么多过程最后`export`给用户。那这么多过程中，到底对`Vue`都做了什么，下一节揭晓。
