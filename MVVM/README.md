# vue2 MVVM 核心源码解读

## 范围说明

所谓**MVVM 核心源码解读**，包含两层意思。第一，只解读 MVVM 部分的源码，其他的部分（组件化、SSR、WEEX）都先不 care ；第二，只解读核心的代码，一些锦上添花、提高易用性、提高性能的附加内容暂时不 care ，例如 filter computed watch 等。另外，一些全局 API 、对象 API 的源码也没有被包含进来。

读者可能会认为这是砍掉了很多重点内容，僻重就轻，为了减少工作量 ———— 其实恰恰相反。砍掉的这些都是一些非重点内容，而留下的才是 MVVM 的重点。另外，阅读源码是一件非常枯燥乏味而且工作量巨大的事情（因此它也是学习进步最快的途径），如果来者不拒，那会给自己造成很大的压力，很可能因为体量庞大而早早放弃。**因此，放弃外围关注核心，这是一种技巧，也是一种需要**。

注意，虽然我们忽略了很多，但是剩余的内容已久很多，请大家认真、耐心的阅读完，会让你对 MVVM 有更加深刻的理解。

## 阅读要求

- 熟悉基本的 JS 语法基础，例如原型、闭包、异步等
- 熟悉基础的 DOM API ，如`createElement`、DOM 树操作、`nodeType`这些常用属性等
- 熟悉 ES6 基本用法，如`class` 模块化等
- 熟悉 vue 基本用法，不了解的同学可以花约 1 小时去看[教程](https://cn.vuejs.org/v2/guide/)

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

