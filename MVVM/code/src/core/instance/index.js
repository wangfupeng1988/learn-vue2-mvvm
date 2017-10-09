import { initMixin } from './init'
import { renderMixin } from './render'
import { lifecycleMixin } from './lifecycle'

function Vue (options) {
  // 创建之后，立刻初始化, _init 定义于 initMixin 中
  this._init(options)
}

// 定义 Vue.prototype._init
initMixin(Vue)

// 定义 Vue.prototype._update
lifecycleMixin(Vue)

// 定义 Vue.prototype._render 以及 _o _n _s 等 vdom 使用的缩写函数
renderMixin(Vue)

export default Vue
