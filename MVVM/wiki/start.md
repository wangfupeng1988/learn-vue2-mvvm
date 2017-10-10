
# start

简单概述一下 vue2 MVVM 核心代码的基本逻辑和流程。先呈上一张比较简练的流程图（该图是网络上找的，并不是我画的），该图能很清晰的概述整个流程。

![](https://user-images.githubusercontent.com/9583120/31386983-622b714a-ad8e-11e7-97c7-02204e7a388f.png)

借图说话，阅读 MVVM 代码，其实我们就是要搞明白以下三件事：

- 响应式原理
- 模板引擎
- 虚拟 DOM

看着三个的名字，各个都高大上，和咱们日常的前端开发工作毫不沾边（所以才要学习嘛）。本小节就简单讲述一下这三件事到底做了什么，并不去深入。看不懂没关系 —— 现在就是先让你各种混乱，脑子出现各种不明白和懵逼，然后我们再后面的讲述中各个击破。

## 响应式原理

先上一个最简单的 demo

```html
    <div id="app">
        <p>{{price}} 元</p>
    </div>

    <script type="text/javascript">
    var app = new Vue({
        el: '#app',
        data: {
            price: 100
        }
    })
    </script>
```

运行该页面，然后在浏览器控制台修改`app.price`的值，页面就会随之跟着变化。这里的响应式就是如何监控模型数据的变化，知道了变化才能应对变化。


## 模板引擎

上述 demo 中，对应的模板代码是

```html
    <div id="app">
        <p>{{price}} 元</p>
    </div>
```

其实它就是一段普通的 html 标签，但是在 vue 中不能这么看，它得叫“模板”。光改一个名字不行，还得将它进行一系列的处理，让它变成 JS 可操作的对象（即 AST 抽象语法树）。

对 AST 经过一系列处理之后，还得再把它渲染到页面上，而且要正确的渲染出模型的数据（如`app.price`）。因此，vue 又根据 AST 生成了 render 函数用于接下来的渲染，类似于

```js
function () {
    return createElement('div', {prop: {id: "app"}}, [
        createElement('p', {}, [
            createText(app.price)  // 这里获取了 app.price
        ])
    ])
}
```

## 虚拟 DOM

以上的 render 函数，执行的时候其实是返回一个 vnode（即虚拟 DOM 节点），然后再将 vnode 真正 patch 出 html 到页面去显示。

但是，当`app.price`被改变时，由于响应式的监控，render 函数会被再次执行，产生新的 vnode 。然后 new-vnode 和 old-vnode 进行对比（vnode 对比是非常快的，因此 vue2 之后开始使用虚拟 DOM），然后将必要的更新，更新到 html 中。

## 总结

本小节其实就是让大家看一眼最上面的那个图，以及一开始提到的三点内容。有任何看不懂的地方，都可以愉快的略过，不用较真。
