# 快速了解 Vue2 MVVM

vue2 除了 MVVM 之外，组件化和 SSR 都是很重要的部分，但本文范围只针对 MVVM 。对 vue 不了解的同学可查阅 [vue 教程](https://cn.vuejs.org/v2/guide/) 。

另外，对于这种经典、复杂框架的学习和源码阅读，我也就不求甚解了，因为甚解的成本太高了。因此，能通过最短的时间学习了解大概的流程，得到我想要的就可以，毕竟我也不会去维护 vue 的源码。2/8 原则，会让你做事更加有效率。

-------

## 什么是 MVVM

先来说说我对 MVVM 的理解

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

从 ng react vue 以及其他 MVVM 框架，基本已经用于全球各种 web 系统的开发中，而且是很快推广普及，可见开发人员对它的认可 —— 这也是读者学习 MVVM 的必要性！

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

阅读这份代码，可以从`./code/src/platforms/web/entry-runtime-with-compiler.js`这个入口开始。下文会先介绍 MVVM 的实现逻辑，不会涉及太多源码，文章最后再结合之前的内容来介绍阅读源码的流程（我觉得这样更加合理）。

注意，这份代码只供阅读，不能执行。

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

拿到`data`之后（这里的`data`其实就是 Model ），先赋值一个`__ob__`属性，值是`Observer`的实例，即`data.__ob__ = new Observer(data)`。首先看一下`Observer`函数的定义，为了让读者第一时间看明白原理和流程，把 Vue 源码进行了极致的简化（甚至把数组的处理都去掉了）。

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

![](http://images2017.cnblogs.com/blog/138012/201711/138012-20171105171958201-2013362556.png)

参照文章一开始的整体流程图，响应式这部分讲解的就是红框标出的区域（图片看不到可[下载](http://images2017.cnblogs.com/blog/138012/201711/138012-20171105171958201-2013362556.png)）。简单说来:

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

### 模板处理的三个步骤

参考源码 [./code/src/compiler/index.js](./code/src/compiler/index.js) 中的关键代码，这就是 Vue 处理模板的三个步骤。

```js
// 传入一个函数作为参数
function baseCompile (
  template: string,
  options: CompilerOptions
): CompiledResult {
  // parse 定义于 ./parser/index
  // 将 html 转换为 ast （抽象语法树）
  const ast = parse(template.trim(), options)
  // optimize 定义于 ./optimizer
  // 标记 ast 中的静态节点，即不包含变量无需改变的节点
  optimize(ast, options)
  // generate 定义于 ./codegen/index
  // 返回 {render: '..render函数体..（字符串）', staticRenderFns: Array<string>}
  const code = generate(ast, options)

  // 返回 CompiledResult 格式
  return {
    ast,
    render: code.render,
    staticRenderFns: code.staticRenderFns
  }
}
```

下面先简单介绍一下每一步的作用，看不明白可以直接往下看，下面有更加详细的介绍。

第一步，是将模板处理为 AST，即抽象语法树（Abstract Syntax Tree）。正如浏览器将 HTML 代码处理为结构化的 DOM 树一样，Vue 将模板处理为结构化的 AST ，每个节点都包含了标签、属性以及指令和指令类型，如`v-for` `v-text`等。这个过程，只要读者能理解“将非结构化的字符串处理成结构化的 JSON 数据”，就能理解该过程的用意。

第二步，优化 AST ，找到最大静态子树。这一步就是要分清楚，在 AST 当中，哪些是动态的，哪些是静态的。其实，通过判断该节点以及其子节点有没有关联指令就可以判断。指令中绑定了 Model 的数据，Model 一更新，动态的节点肯定要随时更新。而静态节点和 Model 都没有关系，因此只更新一次即可。总之，第二步是为了提高后面更新 View 的效率。

第三步，生成 render 函数，将模板字符串转换为 JS 真正可执行的函数。可直接看下文的详细介绍。

### 生成 AST

```html
<div id="app">
    <p>{{price}} 元</p>
</div>
```

上面是一个最简单的模板，它经过 Vue 的处理并生成的 AST 简化之后大概这样

```js
{
    type: 1,  // 对应 nodeType
    tag: 'div',
    attrs : {id: 'app'},
    children: [
        {
            type: 1,
            tag: 'p',
            attrs: {},
            children: [
                {
                    type: 2,  // text 类型
                    text: '{{price}} 元',
                    expression: '_s(price)+" 元"'
                }
            ]
        }
    ]
}
```

模板和 AST 的对应关系应该不用多说了，有 JS DOM 操作基础的读者应该都能看得懂。重点关注一下 AST 中的`expression: '_s(price)+" 元"'`，对应的是原模板中的`{{price}}`。从表达式的形式可以猜测到，`_s(price)`就是一个函数。但是现在还处于一个字符串中，字符串如何当做函数来执行？—— 下文会有介绍，但是也可以提前想想`new Function(...)`怎么使用。

这里仅仅是拿`{{price}}`这样最简单的一个表达式指令做例子。不同的指令，在 AST 中会有不同的形式来表示。读者可以自己运行一个 Vue 的 demo 然后在 Vue.js 源码中搜索`var ast = parse(template.trim(), options);`，然后再下一行加`console.log(ast)`自己去看。总结一下，Vue 将模板字符串转化为 AST 主要有两个目的，最终目的还是让 JS 代码能读懂这个模板：

- 将非结构化的字符串转化为结构化的对象
- 将 html 和 JS 都不能直接识别的指令，转化为 JS 能识别的表达式形式

> PS：人和计算机是一对矛盾，人易读懂的（如模板、指令）计算机却不易不懂，计算机易读懂的（表达式、复杂的函数体）人却很难读懂。这个矛盾一直存在着，人也一直妥协着，因为计算式傻笨傻笨的不懂得像人妥协。

接着来说一下 Vue 是如何将模板字符串解析成 AST 结构的。

假如我们现在要做一个简单的搜索引擎或者网络爬虫，从成千上网的网页上抓取各种页面信息，那么最终抓取到的结构是什么呢？—— 是一个一个的 html 文件。接下来该如何分析这些 html 文件呢（或者是 html 字符串），肯定是先得将这坨字符串进行结构化。这种场景，想来大家也能猜到，业界肯定已经早就有了现成的工具去做这件事，可以上网搜一下`htmlparser`。

Vue 就参考了 htmlparser 去解析模板，源码参见 [./code/src/compoler/parser/html-parser.js](./code/src/compoler/parser/html-parser.js) 。我自己总结的简化版源码中，将该代码省略了。因为它太复杂，不易于阅读，我找打了一个更加简单的理解方式 simplehtmlparser.js —— 为了投机取巧也不容易。

```html
<script type="text/javascript" src="./simplehtmlparser.js"></script>
<script type="text/javascript">
    var parser = new SimpleHtmlParser();
    var html = '<div id="app">\n<p v-show="show">hello parser</p>\n<!--my-comment-->\n</div>';
    console.log(html)

    // 处理器
    var handler = {
        startElement: function (sTagName, oAttrs) {
            console.log(sTagName, oAttrs)
        },
        endElement: function (sTagName) {
            console.log(sTagName, 'end')
        },
        characters: function (s) {
            console.log(s, 'characters')
        },
        comment: function (s) {
            console.log(s, 'comment')
        }
    };

    // parse
    parser.parse(html, handler);
</script>
```

以上是使用 simplehtmlparser.js 的例子，源码在 [./test/htmlparser/demo.html](./test/htmlparser/demo.html) 中。从这个例子的使用，基本就能看出 Vue 使用 htmlparser 的过程，想了解 htmlparser 的内部逻辑，也可参考 [./test/htmlparser/simplehtmlparser.html](./test/htmlparser/simplehtmlparser.html) ，只有 100 行代码，非常简单易懂。

从 demo 中看，htmlparser 接收到模板字符串，然后能分析出每个 tag 的开始、结束，tag 的类型和属性。有了这些，我们就能将一个模板字符串生成一个 AST 。具体的过程，大家可以参考源码 [./code/src/compoler/parser/index.js](./code/src/compoler/parser/index.js)

### 优化 AST 找到最大静态子树

```html
<div id="app">
    <p>{{price}} 元</p>
</div>
```

这个模板生成 AST ，是没有静态节点的，因为都是`{{price}}`的父节点，`price`一变都得跟着受牵连。但是下面这个模板就会有静态节点

```html
<div id="app">
    <div id="static-div">
        <p>白日依山尽</p>
        <p>黄河入海流</p>
    </div>
    <p>{{price}} 元</p>
</div>
```

和 Model 数据（即`price`）相关的都是动态节点，其他无关的都是静态节点。因此，这些模板对应的节点都是静态的：

```html
    <div id="static-div">
        <p>白日依山尽</p>
        <p>黄河入海流</p>
    </div>
```

最后，根据节点的父子关系，要找出最外层的静态节点，因为只要该节点确认为静态，其子节点都无需关心，肯定也是静态的。这个最外层的静态节点就是`<div id="static-div">`，即标题中提到的“最大静态子树”。那么，该模板最终生成的 AST 简化之后是这样的：

```js
{
    type: 1,
    tag: 'div',
    attrs: {id: 'app'},
    children: [
        {
            type: 1,
            tag: 'div',
            attrs: {id: 'static-div'},
            children: [
                // 省略两个静态的 p 节点
            ],
            static: true
        },
        {
            // 省略 <p>{{price}} 元</p> 节点
        }
    ],
    static: false
}
```

在知道如何标注出静态节点的最后，还是要再次强调一下标注最大静态子树的用意：根据 MVVM 的交互方式，Model 的数据修改要同时修改 View ，那些 View 中和 Model 没有关系的部分，就没必要随着 Model 的变化而修改了，因此要将其标注为静态节点。最终目的就是要更加更新 View 的效率。

### 生成 render 函数

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
            _t(this.prirce + ' 元')
        ])
    ])
}
```

看以上代码的函数和最初的模板，是不是很相似？他们的区别在于：模板是 html 格式，但是 html 不会识别`{{price}}`；而函数完全是 JS 代码，`this.price`放在 JS 中完全可以被运行。

以上还是以一个最简单的模板为例，模板如果变的复杂，需要注意两方面：

- 不同的指令，生成 render 函数会不一样。指令越多，render 函数会变得越复杂。
- 如果有静态的节点，将不会在 render 函数中体现，而是在`staticRenderFns`中体现。静态节点只会在初次显示 View 的时候被执行，后续的 Model 变化将不会再触发静态节点的渲染。

### 整理流程

![](http://images2017.cnblogs.com/blog/138012/201711/138012-20171105172006013-1526755172.png)

参考文章一开始给出的流程图，模板渲染就是图中红框标出那部分（图片看不到可[下载](http://images2017.cnblogs.com/blog/138012/201711/138012-20171105172006013-1526755172.png)）。简单看来就是 3 部分：

- 根据模板生成 AST
- 优化 AST 找出其静态，不依赖 Model 改变而改变的部分
- 根据优化后的 AST 生成 render 函数

### 和绑定依赖的关系

回顾文章一开始介绍响应式的那部分，通过`Object.defineProperty`的设置，在 Model 属性`get`的时候会被绑定依赖。现在看一下 render 函数，在 render 函数执行的时候，肯定会触发`get`，从而绑定依赖。

因此，到这里，绑定依赖的逻辑，就首先清楚了。

### 接下来

该部分最后生成是 render 函数，那么 render 函数何时被执行，以及执行的时候生成了什么，下文将要介绍。

-------

## 虚拟 DOM

这部分是围绕着 vdom 来介绍 View 的渲染，包括 View 的渲染和更新、以及响应式如何触发这种更新机制。但是，不会深入讲解 vdom 内部的原理。Vue2 源码中的 vdom 也不是完全自己写的，而是将 [Snabbdom](https://github.com/snabbdom/snabbdom)  这一经典的 vdom 开源库集成进来的。想要深入学习 vdom 可参考：

- 经典博客 [深度解析 vdom](https://github.com/livoras/blog/issues/13)
- 《Vue.js 权威指南》一书中介绍 vdom 的章节，通过示例和图形的方式介绍的比较清晰
- Snabbdom 的使用和实现，具体资源网上去搜

### vdom 的基本使用

浏览器中解析 html 会生成 DOM 树，它是由一个一个的 node 节点组成。同理，vdom 也是由一个一个的 vnode 组成。vdom 、 vnode 都是用 JS 对象的方式来模拟真实的 DOM 或者 node 。

参考 [Snabbdom](https://github.com/snabbdom/snabbdom) 的样例

```js
// 获取容器元素
var container = document.getElementById('container');
// 创造一个 vnode
var vnode = h('div#container.two.classes', {on: {click: someFn}}, [
  h('span', {style: {fontWeight: 'bold'}}, 'This is bold'),
  ' and this is just normal text',
  h('a', {props: {href: '/foo'}}, 'I\'ll take you places!')
]);
// Patch into empty DOM element – this modifies the DOM as a side effect
patch(container, vnode);
```

`h`函数可以生成一个 vnode ，然后通过`patch`函数将生成的 vnode 渲染到真实的 node（`container`）中。这其中涉及不到 vdom 的核心算法 —— diff 。继续追加几行代码：

```js
var newVnode = h('div#container.two.classes', {on: {click: anotherEventHandler}}, [
  h('span', {style: {fontWeight: 'normal', fontStyle: 'italic'}}, 'This is now italic type'),
  ' and this is still just normal text',
  h('a', {props: {href: '/bar'}}, 'I\'ll take you places!')
]);
// Second `patch` invocation
patch(vnode, newVnode); // Snabbdom efficiently updates the old view to the new state
```

又生成了新的 vnode `newVnode` ，然后`patch(vnode, newVnode)`。这其中就会通过 diff 算法去对比`vnode`和`newVnode`，对比两者的区别，最后渲染真实 DOM 时候，只会将有区别的部分重新渲染。在浏览器中，DOM 的任何操作都是昂贵的，减少 DOM 的变动，就会提高性能。

### render 函数生成 vnode

以上示例中，vnode 是手动生成的，在 Vue 中 render 函数就会生成 vnode —— render 函数就是刚刚介绍过的。这样一串联，整个流程就很清晰了：

- 解析模板最终生成 render 函数。
- 初次渲染时，直接执行 render 函数（执行过程中，会触发 Model 属性的`get`从而绑定依赖）。render 函数会生成 vnode ，然后 patch 到真实的 DOM 中，完成 View 的渲染。
- Model 属性发生变化时，触发通知，重新执行 render 函数，生成 newVnode ，然后`patch(vnode, newVnode)`，针对两者进行 diff 算法，最终将有区别的部分重新渲染。
- Model 属性再次发生变化时，又会触发通知 …… 

另外，还有一个重要信息。如果连续修改多个 Model 属性，那么会连续触发通知、重新渲染 View 吗？—— 肯定不会，**View 的渲染是异步的**。即，Vue 会一次性集合多个 Model 的变更，最后一次性渲染 View ，提高性能。

以上描述的触发 render 函数的过程，可以从源码 [./code/src/core/instance/lifecycle.js] 中`mountComponent`中找到。这一行最关键`vm._watcher = new Watcher(vm, updateComponent, noop)`，其中`updateComponent`就会触发执行 render 函数。

下面就重点介绍一下`new Watcher`是干嘛用的。

### Watcher

Watch 的定义在 [./code/src/core/observer/watcher.js](./code/src/core/observer/watcher.js) 中，简化后的代码如下

```js
import Dep, { pushTarget, popTarget } from './dep'

export default class Watcher {
  constructor (
    vm: Component,
    expOrFn: string | Function,
    cb: Function
  ) {
    // 传入的函数，赋值给 this.geter
    this.getter = expOrFn
    // 执行 get() 方法
    this.value = this.get()
  }

  get () {
    // 将 this （即 Wathcer 示例）给全局的 Dep.target
    pushTarget(this)
    let value
    const vm = this.vm
    try {
      // this.getter 即 new Watcher(...) 传入的第二个参数 expOrFn
      // 这一步，即顺便执行了 expOrFn
      value = this.getter.call(vm, vm)
    } catch (e) {
      // ...
    } finally {
      popTarget()
    }
    return value
  }

  // dep.subs[i].notify() 会执行到这里
  update () {
    // 异步处理 Watcher
    // queueWatcher 异步调用了 run() 方法，因为：如果一次性更新多个属性，无需每个都 update 一遍，异步就解决了这个问题
    queueWatcher(this)
  }

  run () {
    // 执行 get ，即执行 this.getter.call(vm, vm) ，即执行 expOrFn
    this.get()
  }
}
```

结合调用它的语句`new Watcher(vm, updateComponent, noop)`，将`updateComponent`复制给`this.getter`，然后代码会执行到`get`函数。

首先，`pushTarget(this)`将当前的 Wacther 实例赋值给了`Dep.target`。这里要联想到上文介绍响应式的时候的一段代码

```js
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
```

注意看上面代码中的`if (Dep.target) { dep.depend() }`。此前一直说“触发`get`时候绑定依赖”这句话，到现在终于可以有一个结论：绑定的依赖就是这个`new Watcher(...)`。

然后，执行了`this.getter.call(vm, vm)`，即将`updateComponent`执行了，触发了初次的渲染。函数的执行将真正触发`get`，然后绑定依赖。过程基本走通了。

### 触发通知

当 Model 属性修改时会触发到上面代码中的`set`函数，然后执行`dep.notify()`。继续看看这个`notify`函数的内容

```js
export default class Dep {
  // 省略 N 行

  notify () {
    // stabilize the subscriber list first
    const subs = this.subs.slice()
    for (let i = 0, l = subs.length; i < l; i++) {
      // 在 defineReactive 的 setter 中触发
      // subs[i] 是一个 Watcher 实例
      subs[i].update()
    }
  }
}
```

这里的`subs`就存储着所有的`Watcher`实例，然后遍历去触发它们的`update`方法。找到上文粘贴出来的`Watcher`的源码，其中`update`这么定义的：

```js
  // dep.subs[i].notify() 会执行到这里
  update () {
    // 异步处理 Watcher
    // queueWatcher 异步调用了 run() 方法，因为：如果一次性更新多个属性，无需每个都 update 一遍，异步就解决了这个问题
    queueWatcher(this)
  }

  run () {
    // 执行 get ，即执行 this.getter.call(vm, vm) ，即执行 expOrFn
    this.get()
  }
```

看一下代码的注释也基本就能明白了，`update`会异步调用`run`（为何是异步调用，上文也介绍过了）。然后`run`中执行的`this.get()`函数上文已经介绍过，会触发传进来的`updateComponent`函数，也就触发了 View 的更新。

### 最后

该部分虽然名字是“虚拟 DOM”，但是有一半儿介绍了响应式的内容。这也是没办法，Vue MVVM 的整体流程就是这么走的。因此，该部分要求读者明白两点内容：

- vdom 的生成和 patch
- 完整的响应式流程

阅读至此，先忽略掉一些细节，再看文章最开始的这张图，应该会和一开始看不一样吧？图中所画的流程，肯定都能看懂了。

![](https://user-images.githubusercontent.com/9583120/31386983-622b714a-ad8e-11e7-97c7-02204e7a388f.png)

-----

## 如何阅读简化后的源码

下面简单说一下如何阅读我整理出来的只针对 MVVM 的简化后的 Vue2 的源码

- `code/package.json`中，`scripts`规定了打包的各种命令，只看`dev`就好了
- 通过`dev`打包命令，可以对应到`code/build/config.js`，并对应到`web-full-dev`的配置，最终对应到`./code/src/platforms/web/entry-runtime-with-compiler.js`
- 然后剩下的代码，就是可以通过 JS 模块化规则找到。大的模块分为：`src/compiler`是模板编译相关，`src/core/instance`是 Vue 实例相关，`src/core/observer`是响应式相关，`src/core/vdom`是 vdom 相关。

vue2 源码结构非常清晰，读者如果自己做框架和工具的话，可以参考这个经典框架的源码。

-----

## 最后

MVVM 涉及的内容、代码都很多，虽然是快速了解，但是篇幅也很大。外加自己也是现学现卖，难免有些杂乱，读者如有问题或者建议，欢迎给我 [提交 issue](https://github.com/wangfupeng1988/learn-vue2-mvvm/issues) 。

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
- https://item.jd.com/12028224.html

## 关于作者

- 关注作者的博客 - 《[深入理解javascript原型和闭包系列](http://www.cnblogs.com/wangfupeng1988/p/4001284.html)》《[深入理解javascript异步系列](https://github.com/wangfupeng1988/js-async-tutorial)》《[CSS知多少](http://www.cnblogs.com/wangfupeng1988/p/4325007.html)》 
- 学习作者的教程 - 《[前端JS基础面试题](http://coding.imooc.com/class/115.html)》《[React.js模拟大众点评webapp](http://coding.imooc.com/class/99.html)》《[zepto设计与源码分析](http://www.imooc.com/learn/745)》《[用grunt搭建自动化的web前端开发环境](http://study.163.com/course/courseMain.htm?courseId=1103003)》《[json2.js源码解读](http://study.163.com/course/courseMain.htm?courseId=691008)》

如果你感觉有收获，欢迎给我打赏 ———— 以激励我更多输出优质开源内容

![](https://camo.githubusercontent.com/e1558b631931e0a1606c769a61f48770cc0ccb56/687474703a2f2f696d61676573323031352e636e626c6f67732e636f6d2f626c6f672f3133383031322f3230313730322f3133383031322d32303137303232383131323233373739382d313530373139363634332e706e67)