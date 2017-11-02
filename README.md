# 深入理解 Vue2 MVVM

vue2 除了 MVVM 之外，组件化和 SSR 都是很重要的部分，但本文范围只针对 MVVM 。对 vue 不了解的同学可查阅 [vue 教程](https://cn.vuejs.org/v2/guide/) 。

-------

## 什么是 MVVM

### 介绍

MVVM 拆解开来就是 Model View ViewModel ，对设计模式多少了解一些的读者，应该知道 Model View 是什么，关键在于 ViewModel。我在最开始接触 vue 并试图理解 MVVM 的时候，是从下图开始的

![](https://user-images.githubusercontent.com/9583120/32172846-0a520f48-bd4b-11e7-9e2b-1ebdcb293387.jpeg)

当然，还得再结合一个简单的 vue 的代码示例

```html
    <!--上图中的 View 部分-->
    <div id="app">
        <p>{{price}} 元</p>
        <button v-on:click="addHandle">add</button>
    </div>

    <script type="text/javascript">
        /* 上图中的Model */
        var model = {
            price: 100
        }

        /* 上图中的 ViewModel */
        var vm = new Vue({
            el: '#app',
            data: model,
            methods: {
                addHandle: function () {
                    this.price++
                }
            }
        })
    </script>
```

**View** 即视图，我觉得更好的解释是“模板”，就是代码中`<div id="app">...</div>`的内容，用于显示信息以及交互事件的绑定，写过 html 的都明白。

**Model** 即模型，跟 MVC 中的 Model 一样，就是想要显示到模型上的数据，也是我们需要在程序生命周期中可能需要更新的数据。View 和 Model 分开，两者无需相互关心，相比于 jquery 时代，这已经是设计上的一个巨大进步。

两者分开之后得通过 **ViewModel** 连接起来，`el: '#app'`牵着 View ，`data: model`牵着 Model ，还有一个`methods`（其实仅仅是`methods`）充当 controller 的角色，可以修改 Model 的值。

### 带来的改变

如果用 jquery 实现上述功能，那肯定得将 click 事件绑定到 DOM 上，数据的更新会直接修改 DOM —— 总之吧，什么事儿都得操作 DOM 。这样，我们就会将 View Model Controller 完全耦合在一起，很容易搞成意大利面一样的程序。

完全分开之后，click 事件直接关联到 ViewModel 中，事件直接修改 Model ，然后由框架自动去完成 View 的更新。相比于手动操作 DOM ，**你可以通过修改 Model 去控制 View 更新，这样在降低耦合的同时，也更加符合人的逻辑习惯**，简直让人欲罢不能。

-------

## Vue2 MVVM 几大要素

要实现一个基本的 MVVM ，至少需要以下要素：

**响应式**

MVVM 的核心在于 View 和 Model 分离之后的数据绑定，即每次修改 Model 中的数据，View 都能随时得到更新，而不是手动去修改 DOM 。这就需要有一套完善的响应机制，其实就是一种观察者模式。在初始化页面的时候，监听 Model 中的数据，一旦有变化，立即触发通知，更新 View 。

**模板引擎**

模板语法上就是一段 html 代码片段，但是却有好多 vue 定义的指令（directive），例如上文代码中的`{{price}}` `v-on`，还有常用的如`v-model` `v-bind` `v-if` `v-for`等。纯 html 代码的特点是静态，而加上这些指令之后，该模板就不再是静态的，**而是动态、有逻辑的模板**。

自然，模板本身肯定处理不了逻辑，必须借助 JS 才能处理逻辑。那如何把模板放在 JS 中呢 ———— 模板引擎。模板引擎会把一个 html 片段最终解析成一个 JS 函数，让它真正动起来。

**虚拟 DOM**

Model 中的数据一旦有变化，就会重新渲染 View ，但是变化也是有范围的。如果 Model 和 View 都比较复杂，而 Model 中的只有一点点数据的变化，就导致了 View 的全部渲染，可显然不合适，性能上也不允许。

如果是直接去操作 DOM 修改 View 就很难做到性能的极致，而 vdom 就能做到。ViewModel 不会直接操作 DOM 而是把所有对 DOM 的操作都一股脑塞给 vdom ，vdom 进行 diff 之后，再决定要真正修改哪些 DOM 节点。

-------

## 整体流程

![](https://user-images.githubusercontent.com/9583120/31386983-622b714a-ad8e-11e7-97c7-02204e7a388f.png)

以上是一个完成流程的概述，介绍 Vue MVVM 把这张图放出来是最合适的。图的上部，`compiler` `PARSER` `CODEGEN` 表示的是上文中说的**模板引擎**。图的下部，`Observer` `Dep` `Watcher` 表示的是上文说的**响应式**。vdom 没有在途中表述出来，它其实是隐藏在`render`里面了。

还未开始详细介绍 MVVM 之前，该图也不用太关心细节，知道一个大概即可，待介绍完之后，还会再来回顾这幅图。另外，在阅读下文章节的时候，读者也可以经常来回顾一下这幅图，相信随着你看的进展，这幅图会慢慢理解。

----

## 关于精简后的源码

进入 [这里](./code) 查看精简之后的 Vue 源码，根据 v2.4.2 版本，下文在讲述 MVVM 的时候会经常用到这份精简的源码。精简的依据有两种：

- 忽略了 MVVM 之外（如组件、ssr、weex、全局 API 等）的代码
- 只关注 MVVM 的核心功能，其他增加易用性的功能（watch computed 等）忽略

阅读这份代码，可以从`./code/src/platforms/web/entry-runtime-with-compiler.js`这个入口开始。注意，这份代码只供阅读，不能执行。

-------

## 响应式

### Object.defineProperty

> `Object.defineProperty`是 ES5 中新增的一个 API 目前（2017.11）看来，浏览器兼容性已经不是问题，特别是针对移动端。

对于一个简单的 JS 对象，每当获取属性、重新赋值属性的时候，都要能够监听到（至于为何有这种需求，先不要管）。以下方式是无法满足需求的

```js
var obj = {
    name: 'zhangsan',
    age: 25
}
console.log(obj.name)  // 获取属性的时候，如何监听到？
obj.age = 26           // 赋值属性的时候，如何监听到？
```

借用`Object.defineProperty`就可以实现这种需求

```js
var obj = {}
var name = 'zhangsan'
Object.defineProperty(obj, "name", {
    get: function () {
        console.log('get')
        return name  
    },
    set: function (newVal) {
        console.log('set')
        name = newVal
    }
});

console.log(obj.name)  // 可以监听到
obj.name = 'lisi'      // 可以监听到
```

回想一下 Vue 的基本使用，修改 model 的值之后，view 会立刻被修改，这个逻辑用到的核心 API 就是`Object.defineProperty`。当你要向别人介绍 Vue MVVM 的内部实现，第一个提到的 API 也应该是`Object.defineProperty`。

### 数组的变化如何监听？

针对 JS 对象可以使用`Object.defineProperty`来做监控，但是针对数组元素的改变，却用不了，例如数组的`push` `pop`等。

Vue 解决这个问题的办法也比较简单粗暴，直接将需要监听的数组的原型修改了。**注意，并不是将`Array.prototype`中的方法改了，那样会造成全局污染，后果严重**。看如下例子：

```js
var arr1 = [1, 2, 3]
var arr2 = [100, 200, 300]
arr1.__proto__ = {
    push: function (val) {
        console.log('push', val)
        return Array.prototype.push.call(arr1, val)
    },
    pop: function () {
        console.log('pop')
        return Array.prototype.pop.call(arr1)
    }
    // 其他原型方法暂时省略。。。。
}

arr1.push(4)    // 可监听到
arr1.pop()      // 可监听到
arr2.push(400)  // 不受影响
arr2.pop()      // 不受影响
```

Vue 实现的时候会考虑更加全面，不会这么简单粗暴的赋值，但是基本原理都是这样的。如果读者不是特别抠细节的话，了解到这里就 OK 了。

### 给 model 分配一个 Observer 实例

以上介绍了针对 JS 对象和数组，监听数据变化的技术方案。接下来通过一个简单的例子，看一下 Vue 如何做对数据进行监控。先定义一个简单的 Vue 使用示例。

```js
var vm = new Vue({
    data: {
        price: 100
    }
})
```

拿到`data`之后（这里的`data`其实就是 Model ），先赋值一个`__ob__`属性，值是`Observer`的实例，即`data.__ob__ = new Observer(data)`。首先看一下`Observer`函数的定义，为了让读者第一时间看明白原理和流程，把 Vue 源码进行了极致的简化（甚至把数组的处理都去掉了）

```js
export class Observer {
  value: any;
  dep: Dep;

  constructor (value: any) {
    this.value = value
    this.dep = new Dep()
    this.walk(value)
  }

  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }
}
```

有两个属性和一个方法。`value`属性就指向了`data`本身，`dep`属性指向一个新创建的`Dep`的实例（`Dep`我们后面再说），还有一个`walk`方法。

### walk

`walk`方法一看就明白，遍历`data`的所有属性，然后执行`defineReactive(data, key, value)`方法。其实，就是将要执行上文介绍的`Object.defineProperty`来绑定监听。

看到这里，就明白 Vue 是对初始化时 Model 中已有的数据进行监听。如果初始化完成，再去手动扩展 Model 的属性，新扩展的就无法进行监听了，处分使用 Vue 提供的特有的扩展 API 。

> PS：其实 JS 对象才会走`walk`方法，数组会走另一个方法（上文说过对象和数组的监听方式不一样，因此原因）。但是为了理解简单，就先不管数组了，不影响继续往前赶。

### defineReactive

按照之前的思路

```js
var vm = new Vue({
    data: {
        price: 100
    }
})
```

执行这个方法时的参数应该是这样的`defineReactive(data, key, value)`，`key`和`value`即是`data`的属性和属性值，虽然这里只有一个`price`属性。`defineReactive`的内部实现可以简化为：

```js
export function defineReactive (
  obj: Object,
  key: string,
  val: any
) {
    // 每次执行 defineReactive 都会创建一个 dep ，它会一直存在于闭包中
    const dep = new Dep()

    Object.defineProperty(obj, key, {
        get: function reactiveGetter () {
            if (Dep.target) {
              dep.depend()
            }
            return val
        },
        set: function reactiveSetter (newVal) {
            val = newVal
            dep.notify()
        }
    })
}
```

代码跟之前介绍`Object.defineProperty`的时候很相似，区别在于函数中有一个`const dep = new Dep()`（第二次遇到了`Dep`）。而且，在`get`中执行`dep.depend()`，在`set`中触发`dep.notify()`。

### Dep

至于`Dep`是什么，现在无需详细关注，因为它还依赖于另外一个函数，因此现在讲不明白。但是，读者如果有设计模式的了解，再加上你对 Vue 的了解，应该能猜到写什么。

是的，`dep.depend()`就是**绑定依赖**，`dep.notify()`就是**触发通知**，标准的观察者模式。而且，还有知道，是在`get`的时候绑定依赖，在`set`的时候触发通知。在`set`时候触发通知这个很容易理解，要不然修改 Model ，View 怎么会更新呢。那么为何在`get`时候绑定依赖？—— 你不绑定，怎么知道触发什么通知？**而且更重要的，只有`get`过的属性才会绑定依赖，未被`get`过的属性就忽略不管**。这样就保证了只有和 View 有关联的 Model 中的属性才会被绑定依赖关系，这一点很重要。

### 整体流程

![](http://images2017.cnblogs.com/blog/138012/201711/138012-20171101220930295-735942253.png)

参照文章一开始的整体流程图，响应式这部分讲解的其实就是红框标出的区域。简单说来:

- 就是拿到`data`，创建`Observer`实例
- 创建过程中会使用`walk`遍历（先不考虑数组的情况）所有`data`的属性
- 针对`data`每一个属性都执行`defineReactive(data, key, value)`（即使用`Object.defineProperty`监听`get`和`set`）
- `get`的时候会绑定依赖，`set`的时候会触发通知，即观察者模式（至于如何绑定依赖、如何触发通知，下文会讲解）。

### 考虑递归

以上讲解为了便于快速理解都是拿结构很简单的 Model 做示例，即`data`的属性都是值类型，而不是对象。

```js
var vm = new Vue({
    data: {
        price: 100
    }
})
```

如果`data`的属性中再有对象或者数组，层级结构变得很复杂，如

```js
var vm = new Vue({
    data: {
        list: [
            {x: 100},
            {y: 200},
            {z: 300}
        ],
        info: {
            a: 'a',
            b: {
                c: 'c'
            }
        }
    }
})
```

这种复杂的情况必须通过**递归**来解决。如果读者对上面简单的示例都理解了，外加你有良好的编程能力（熟悉递归），那这个过程应该不难理解（虽然逻辑上比较绕）—— 关键是要有对递归的熟练掌握。

> PS：为何要针对`data`创建`Observer`实例，而不是直接对`data`执行`walk`？是因为`Observer`实例中有一个`dep`属性，在递归时候会被用到。展开来讲非常绕（递归本来也不适合用语言去描述），自己去代码中找吧，在`defineReactive`函数中搜索`childOb`就能找到相关信息。

### 接下来

最后留了两个未完待续的点：第一，`get`中绑定依赖；第二，`set`中触发通知。针对这个简单的示例：

```js
var vm = new Vue({
    el: '#app',
    data: model,
    methods: {
        addHandle: function () {
            this.price++
        }
    }
})
```

第二点的入口能轻易找到，即`this.price++`，修改`data`属性会触发`set`，然后触发通知，更新 View（虽然现在还不清楚如何更新 View，别急）。但是针对第一点，`get`到`price`的地方肯定是模板（即`<p>{{price}} 元</p>`）中显示的时候，接下来就讲一下如何处理模板、如何`get`到属性。看看 Vue 强大的模板引擎是如何工作的，这也是 Vue2 相比于 Vue1 升级的重点之一。

最后，也可参考 Vue 教程中的 [深入理解响应式](https://cn.vuejs.org/v2/guide/reactivity.html) ，不过这里面还包含了一些当前未讲到的内容，下文会继续讲解。

-------

## 模板解析

模板解析这部分逻辑比较复杂，也借用了一些其他工具，而且是我们平时工作中不怎么使用的。但是它是理解 MVVM 的关键，我尽量简单描述，读者还是应该坚持看完。

### 模板和 html

```html
<div id="app">
    <p>{{price}} 元</p>
</div>
```

这是一个最简单的模板，看似是一个 html 直接可以在浏览器中运行，但是它不是。因为 html 不认识`{{price}}`，也不认识`v-on` `v-if` `v-for`等。对于 Vue 来说，**模板就是模板，就是一段非结构化的 JS 字符串，不是 html 代码**。模板到 html 还要经历好几层，第一步要结构化解析，第二步要生成 vdom ，第三步再渲染为页面。“模板解析”这部分，只关注前两步。

### 以何种方式解析模板

针对一个简单的模板，就如上面列出的最简单的模板，Vue 将用何种方式将模板生成 html 呢（其实是先生成 vdom 然后再生成 html ，这里暂且不争论）？—— 会根据这个模板生成一个函数，执行函数时即生成 html 。这种方式估计绝大多数读者都不会第一时间想到，下面就简单讲述一下这个过程，先明白一个大概。

还是以下面一段最简单的模板为例

```html
<div id="app">
    <p>{{price}} 元</p>
</div>
```

以上模板中的`price`完全可以通过`vm.price`获取，这个没问题。然后还需要定义一个函数`_c`，这个函数用于创建一个 node（不管是 elem 还是 vnode），再定义一个函数`_t`，用于创建文本标签。

```js
function _c(tag, attrs, children) {
    // 省略函数体
}
function _t(text) {
    // 省略函数体
}
```

然后，根据模板的内容生成如下字符串，注意字符串中的`_c` `_t`和`this.price`

```js
var code = '_c("div", {id: "app"}, [_c("p", {}, [_t(this.price)])])'
```

再然后，就可以通过`var render = new Function(code)`来生成一个函数，最终生成的函数其实就是这样一个格式：

```js
render = function () {
    _c('div', {id: 'app'}, [
        _c('p', {}, [
            _t(this.prirce)
        ])
    ])
}
```

看以上代码的函数和最初的模板，是不是很相似？他们的区别在于：模板是 html 格式，但是 html 不会识别`{{price}}`；而函数完全是 JS 代码，`this.price`放在 JS 中完全可以被运行。

以上简单描述了从模板到 render 函数的简单过程，其中省略了很多细节和实现方式，下文会深入讲解。不过在看下文之前，这一点的内容还是要求读者必须能轻松理解，否则看下文将会很吃力。

### 针对纯静态节点的考虑

也同时介绍出 staticRenderFns ，介绍出来它的用意

### 解析模板的基本工具

可以先用 simplehtmlparser.js 做例子

### AST - Abstract Syntax Tree

待完善……

### 最大静态子树

待完善……

### code-gen

待完善……

### 生成函数

待完善……

-------

## 虚拟 DOM

待完善……

https://github.com/livoras/blog/issues/13 深度解析 vdom



-------

## 整理流程

待完善……

- Observer Dep Watcher 的关系
- ast render vdom 的关系


-------

## 参考链接

- https://segmentfault.com/a/1190000004346467
- http://www.cnblogs.com/libin-1/p/6845669.html
- https://github.com/xiaofuzi/deep-in-vue/blob/master/src/the-super-tiny-vue.js
- https://github.com/KevinHu-1024/kevins-blog/issues/1
- https://github.com/KevinHu-1024/kevins-blog/issues/5
- https://github.com/liutao/vue2.0-source
- http://www.jianshu.com/p/758da47bfdac
- http://www.jianshu.com/p/bef1c1ee5a0e
- http://www.jianshu.com/p/d3a15a1f94a0
- https://github.com/luobotang/simply-vue
- http://zhouweicsu.github.io/blog/2017/03/07/vue-2-0-reactivity/
- https://segmentfault.com/a/1190000007334535
- https://segmentfault.com/a/1190000007484936
- http://www.cnblogs.com/aaronjs/p/7274965.html
- http://www.jackpu.com/-zhang-tu-bang-zhu-ni-xiao-hua-vue2-0de-yuan-ma/
- https://github.com/youngwind/blog/issues
- https://www.zybuluo.com/zhouweicsu/note/729712
- https://github.com/snabbdom/snabbdom
- https://github.com/Matt-Esch/virtual-dom
- https://gmiam.com/post/evo.html
- https://github.com/livoras/blog/issues/13
- https://calendar.perfplanet.com/2013/diff/
- https://github.com/georgebbbb/fakeVue
- http://hcysun.me/2016/04/28/JavaScript%E5%AE%9E%E7%8E%B0MVVM%E4%B9%8B%E6%88%91%E5%B0%B1%E6%98%AF%E6%83%B3%E7%9B%91%E6%B5%8B%E4%B8%80%E4%B8%AA%E6%99%AE%E9%80%9A%E5%AF%B9%E8%B1%A1%E7%9A%84%E5%8F%98%E5%8C%96/
- https://github.com/answershuto/learnVue
- https://github.com/xufei/blog/issues/10
- https://cn.vuejs.org/v2/guide/reactivity.html

## 关于作者

- 关注作者的博客 - 《[深入理解javascript原型和闭包系列](http://www.cnblogs.com/wangfupeng1988/p/4001284.html)》《[深入理解javascript异步系列](https://github.com/wangfupeng1988/js-async-tutorial)》《[CSS知多少](http://www.cnblogs.com/wangfupeng1988/p/4325007.html)》 
- 学习作者的教程 - 《[前端JS基础面试题](http://coding.imooc.com/class/115.html)》《[React.js模拟大众点评webapp](http://coding.imooc.com/class/99.html)》《[zepto设计与源码分析](http://www.imooc.com/learn/745)》《[用grunt搭建自动化的web前端开发环境](http://study.163.com/course/courseMain.htm?courseId=1103003)》《[json2.js源码解读](http://study.163.com/course/courseMain.htm?courseId=691008)》

如果你感觉有收获，欢迎给我打赏 ———— 以激励我更多输出优质开源内容

![](https://camo.githubusercontent.com/e1558b631931e0a1606c769a61f48770cc0ccb56/687474703a2f2f696d61676573323031352e636e626c6f67732e636f6d2f626c6f672f3133383031322f3230313730322f3133383031322d32303137303232383131323233373739382d313530373139363634332e706e67)