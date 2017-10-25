# observe 函数

接上一节，在`initData`函数的最后有一行`observe(data)`，从这里开始就没有将，本节就开始讲解。

`observe`这个函数定义于`core/observer/index.js`中，简化之后的函数定义如下

```js
export function observe (value: any): Observer | void {
    // 最初从 initData 进来的时候，value 即 new Vue(...) 配置的 data 属性
    // 后续递归的时候，可能是 data 的各个属性或者子属性

    if (!isObject(value)) {
      // value 必须是对象
      return
    }
    let ob
    if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
        // 已有的，就直接返回
        ob = value.__ob__
    } else {
        // 创建一个新的（其中会把创建的示例绑定到 value.__ob__ 上）
        ob = new Observer(value)
    }
    return ob
}
```

如上代码。首先你要知道，第一次进入`observe`函数的参数，是我们`new Vue({...})`定义的`data`属性值（`data`属性值一般会是一个对象）。`observe`这个函数会递归调用（会在后面介绍递归的过程），即递归`data`的所有子属性然后调用，但是属性值必须是对象，否则直接`return`。

继续往下看代码，如果`value.__ob__`有值，那么直接获取出来并且返回，没有则`new Observer(value)`并且返回，这个逻辑应该很好理解，就是一个最简单基本的缓存策略。当然，读者应该也能猜到，`new Observer(value)`的时候肯定会把新创建的实例存储到`value.__ob__`属性值中，这是正确的，在下一节我们会验证。

最后，返回一个`Observer`的实例，无论是刚刚新创建的还是已经存储在`__ob__`中的。下一节我们将关注`new Observer(value)`是怎么实现的。
