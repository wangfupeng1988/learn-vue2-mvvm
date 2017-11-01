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

参照文章一开始的整体流程图，响应式这部分讲解的其实就是红框标出的区域。

![](http://images2017.cnblogs.com/blog/138012/201711/138012-20171101220930295-735942253.png)

简单说来，就是拿到`data`，创建`Observer`实例，其中会使用`walk`遍历（先不考虑数组的情况）所有`data`的属性，针对`data`每一个属性都执行`defineReactive(data, key, value)`（即使用`Object.defineProperty`监听`get`和`set`）。`get`的时候会绑定依赖，`set`的时候会触发通知，即观察者模式（至于如何绑定依赖、如何触发通知，下文会讲解）。

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

第二点的入口能轻易找到，即`this.price++`，修改`data`属性会触发`set`，然后触发通知，更新 View（虽然现在还不清楚如何更新 View，别急）。但是针对第一点，`get`到`price`的地方肯定是模板（即`<p>{{price}} 元</p>`）中显示的时候，接下来就讲一下如何处理模板、如何`get`到属性。

看看 Vue 强大的模板引擎是如何工作的，这也是 Vue2 相比于 Vue1 升级的重点之一。

-------

## 模板解析




-------

## 虚拟 DOM

https://github.com/livoras/blog/issues/13 深度解析 vdom



-------

## 整理流程

Observer Dep Watcher 的关系
ast render vdom 的关系


-------

## 参考链接

- [参考链接](./REFERENCE-LINKS.md)
