const { defineConfig } = require('@vue/cli-service')

const authTarget = process.env.VUE_AUTH_PROXY_TARGET || 'http://localhost:8080'
const novelsTarget = process.env.VUE_NOVELS_PROXY_TARGET || 'http://localhost:8000'

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: Number(process.env.VUE_APP_DEV_SERVER_PORT) || 8081,
    proxy: {
      '^/(oauth2|public|user|admin|books|library|actuator)': {
        target: authTarget,
        changeOrigin: true
      },
      '^/novels': {
        target: novelsTarget,
        changeOrigin: true
      }
    }
  }
})
