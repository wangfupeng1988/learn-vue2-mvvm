import { patch } from './patch'
import Vue from 'core/index'
import { mountComponent } from 'core/instance/lifecycle'

// install platform patch function
Vue.prototype.__patch__ = inBrowser ? patch : noop

// 此处定义 $mmount
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  // mountComponent 在 core/instance/lifecycle 中定义
  // hydrating 和 ssr 相关，暂忽略
  return mountComponent(this, el, hydrating)
}