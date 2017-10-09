const builds = {
    // Runtime+compiler development build (Browser)
    'web-full-dev': {
      // 入口文件指向 platforms/web/entry-runtime-with-compiler.js
      entry: resolve('web/entry-runtime-with-compiler.js'),
      dest: resolve('dist/vue.js'),
      format: 'umd',
      env: 'development',
      alias: { he: './entity-decoder' },
      banner
    }
}

if (process.env.TARGET) {
    module.exports = genConfig(builds[process.env.TARGET])
} else {
    exports.getBuild = name => genConfig(builds[name])
    exports.getAllBuilds = () => Object.keys(builds).map(name => genConfig(builds[name]))
}