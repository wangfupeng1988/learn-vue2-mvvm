import { createElement } from '../vdom/create-element'

import {
  warn,
  nextTick,
  toNumber,
  toString,
  looseEqual,
  emptyObject,
  handleError,
  looseIndexOf,
  defineReactive
} from '../util/index'

import { createElement } from '../vdom/create-element'
import { renderList } from './render-helpers/render-list'
import { renderSlot } from './render-helpers/render-slot'
import { resolveFilter } from './render-helpers/resolve-filter'
import { checkKeyCodes } from './render-helpers/check-keycodes'
import { bindObjectProps } from './render-helpers/bind-object-props'
import { renderStatic, markOnce } from './render-helpers/render-static'
import { bindObjectListeners } from './render-helpers/bind-object-listeners'
import { resolveSlots, resolveScopedSlots } from './render-helpers/resolve-slots'

export function initRender (vm: Component) {
  // createElement 即生成一个 vnode
  vm._c = (a, b, c, d) => createElement(vm, a, b, c, d, false)
  vm.$createElement = (a, b, c, d) => createElement(vm, a, b, c, d, true)
}

export function renderMixin (Vue: Class<Component>) {
  // 将 vm 渲染为 vnode 对象
  Vue.prototype._render = function (): VNode {

    // 举一个最简单的例子，如果模板是 <div id="app"><p>{{price}} 元</p></div>
    // 则 render 函数体就是 with(this){return _c('div',{attrs:{"id":"app"}},[_c('p',[_v(_s(price)+" 元")])])}
    // 生成 render 函数，执行 render.call(...) 之后返回的是 vnode 实例
    // 具体就要看 _c 函数如何定义（_c 就是 createElemenet ,定义于本文中）

    var vm = this;
    var ref = vm.$options;
    var render = ref.render;
    var staticRenderFns = ref.staticRenderFns;
    var _parentVnode = ref._parentVnode;

    var vnode;
    // vm.$createElement 定义于本文件 initRender 函数中
    // vm._renderProxy 就是 vm 本身
    vnode = render.call(vm._renderProxy, vm.$createElement);
    // set parent
    vnode.parent = _parentVnode;
    // 返回
    return vnode
  }

  Vue.prototype._o = markOnce
  Vue.prototype._n = toNumber
  Vue.prototype._s = toString
  Vue.prototype._l = renderList
  Vue.prototype._t = renderSlot
  Vue.prototype._q = looseEqual
  Vue.prototype._i = looseIndexOf
  Vue.prototype._m = renderStatic
  Vue.prototype._f = resolveFilter
  Vue.prototype._k = checkKeyCodes
  Vue.prototype._b = bindObjectProps
  Vue.prototype._v = createTextVNode
  Vue.prototype._e = createEmptyVNode
  Vue.prototype._u = resolveScopedSlots
  Vue.prototype._g = bindObjectListeners
}