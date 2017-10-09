export function addHandler (
  el: ASTElement,
  name: string,
  value: string
) {
  let events
  // 事件都存储在 el.events 中
  events = el.events || (el.events = {})
  // 新事件
  const newHandler = { value }
  // 看是否已有 name 的其他事件
  const handlers = events[name]
  if (Array.isArray(handlers)) {
    handlers.push(newHandler)
  } else if (handlers) {
    events[name] = [handlers, newHandler]
  } else {
    // 存储事件
    events[name] = newHandler
  }
}

export function addAttr (el: ASTElement, name: string, value: string) {
  (el.attrs || (el.attrs = [])).push({ name, value })
}

export function addDirective (
  el: ASTElement,
  name: string,
  rawName: string,
  value: string
) {
  (el.directives || (el.directives = [])).push({ name, rawName, value })
}

export function getAndRemoveAttr (el: ASTElement, name: string): ?string {
  let val
  if ((val = el.attrsMap[name]) != null) {
    const list = el.attrsList
    for (let i = 0, l = list.length; i < l; i++) {
      if (list[i].name === name) {
        list.splice(i, 1)
        break
      }
    }
  }
  return val
}