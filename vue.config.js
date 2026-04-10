const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  },
  transpileDependencies: true,
  devServer: {
    proxy: {
      '^/api': {
        target: 'http://477201a5.r12.cpolar.top:18081/',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
})
