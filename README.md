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

-------

## 响应式处理




-------

## 模板解析




-------

## 虚拟 DOM





-------

## 参考链接

- [参考链接](./REFERENCE-LINKS.md)
