const tagRE = /\{\{((?:.|\n)+?)\}\}/g

export function parseText (text) {
  // text 如 '{{price}} 元' 或者 '价格 {{price}}' 形式
  if (!tagRE.test(text)) {
    return
  }
  const tokens = []
  let lastIndex = tagRE.lastIndex = 0
  let match, index
  while ((match = tagRE.exec(text))) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      // '价格 {{price}}' 情况下，token.push('"价格 "')
      tokens.push(JSON.stringify(text.slice(lastIndex, index)))
    }
    // tag token
    const exp = match[1].trim()
    // token.push('_s(price)') , _s 在 core/instance/render.js 中定义
    tokens.push(`_s(${exp})`)
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    // '{{price}} 元' 情况下，token.push('" 元"')
    tokens.push(JSON.stringify(text.slice(lastIndex)))
  }
  // 最终返回 '_s(price)+" 元"' 或者 '"价格 "+_s(price)'
  return tokens.join('+')
}