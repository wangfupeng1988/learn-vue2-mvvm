
import Vue from './runtime/index'
import { compileToFunctions } from './compiler/index'

// $mount 在 ./runtime/index 中定义
const mount = Vue.prototype.$mount;

// 重新定义 $mount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  const options = this.$options

  // resolve template/el and convert to render function
  // 如果用户没有传递 render 函数，就解析 template/el 生成 render 函数
  if (!options.render) {
    let template = options.template
    if (template) {
      // 如果 # 开头（id），拿到这个元素的模板，重新赋值给 template
      // 如果是 node 节点，拿到 innerHTML 重新赋值给 template
    } else if (el) {
      // 拿到 el 的模板，赋值给 template
      template = getOuterHTML(el)
    }
    if (template) {
      // compileToFunctions 定义于 ./compiler/index
      const { render, staticRenderFns } = compileToFunctions(template, {...}, this)

      // 将生成的 render 函数复制给 this.$options.render
      options.render = render
      // 生成 render 函数时，会将静态的方法存储到 staticRenderFns 中，可见 codegen 的 genStatic 方法
      options.staticRenderFns = staticRenderFns
    }
  }

  // 最终执行到 core/instance/lifecycle.js 中的 mountComponent 方法
  // hydrating 和 ssr 相关，暂不考虑
  return mount.call(this, el, hydrating)
}

Vue.compile = compileToFunctions