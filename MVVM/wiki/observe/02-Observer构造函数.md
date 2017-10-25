# Observer 构造函数

上一节最后讲到了`ob = new Observer(value)`，本节讲解`new Observer(value)`都做了什么。首先，我们上一节说过，第一次执行到`observe(data)`时候传递的参数是`new Vue({...})`时候传递的`data`属性值，那么第一次执行`new Observer(value)`时，`value`就是这个`data`，是一个对象。

`Observer`构造函数是定义在`core/observer/index.js`文件中。简化后的代码如下

```js
import Dep from './dep'
import { arrayMethods } from './array'

export class Observer {
  value: any;
  dep: Dep;

  constructor (value: any) {
    this.value = value
    // 新建 Dep 对象
    this.dep = new Dep()

    // 一个 value 一旦创建 observer 示例，即记录下来，无需重复创建
    def(value, '__ob__', this)

    if (Array.isArray(value)) {
      // 数组
      const augment = protoAugment
      // 将数组 value 的 prototype 重写，以便数组更新时能监控到
      augment(value, arrayMethods, arrayKeys)
      // 监听数组
      this.observeArray(value)
    } else {
      // 普通对象
      this.walk(value)
    }
  }

  walk (obj: Object) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      // defineProperty
      defineReactive(obj, keys[i], obj[keys[i]])
    }
  }

  observeArray (items: Array<any>) {
  }
}
```

这个简化后的代码其实可以再进行简化，就是里面涉及到数组的操作，可以暂时先不考虑，后面我们再补充进来。

先从`constructor`开始看。`this.value = value`不用解释。`this.dep = new Dep()`里面`Dep`暂时先不用管，知道是创建了新对象并且复制给`this.dep`就好了。`def(value, '__ob__', this)`可联系上一节的内容，就是将当前的实例给`value.__ob__`赋值。再往下，数组的部分我们先略过，直接看`this.walk(value)`，然后跳转到`walk`方法。

在`walk`方法中，遍历`value`的所有属性，然后执行`defineReactive`，然后就完事儿了。因此下一节要介绍`defineReactive`的细节。
