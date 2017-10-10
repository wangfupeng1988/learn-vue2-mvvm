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

## 下载 vue 源码

该源码解读是基于 vue 2.4.2 版本的，

- 直接下载 vue 2.4.2 源码 https://github.com/vuejs/vue/releases/tag/v2.4.2
- 下载专门用本解读的、已经精简过的源码 https://github.com/wangfupeng1988/vue2-source-code/tree/master/MVVM/code

## 源码解读

- [源码流程概述](./wiki/start.md)

### export Vue

- [从哪里开始](./wiki/export-vue/01-从哪里开始.md)
- [Vue 的定义](./wiki/export-vue/02-Vue的定义.md)
- [对 Vue 的操作](./wiki/export-vue/03-对Vue的操作.md)

### init

- [init 概述](./wiki/init/01-概述.md)
- [callhook](./wiki/init/02-callhook.md)
- [initState](./wiki/init/03-initState.md)

### observe

未完

### template compiler

未完

### code gen

未完

### render

未完

## 参考链接

- [参考链接](./REFERENCE-LINKS.md)

## 打赏作者

如果你看完了，感觉还不错，欢迎给我打赏 ———— 以激励我更多输出优质内容

![](https://camo.githubusercontent.com/e1558b631931e0a1606c769a61f48770cc0ccb56/687474703a2f2f696d61676573323031352e636e626c6f67732e636f6d2f626c6f672f3133383031322f3230313730322f3133383031322d32303137303232383131323233373739382d313530373139363634332e706e67)