const { defineConfig } = require('@vue/cli-service');

const backendTarget = process.env.VUE_APP_BACKEND_PROXY_TARGET || 'http://localhost:8080';

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    port: Number(process.env.VUE_APP_DEV_SERVER_PORT) || 8081,
    proxy: {
      '^/(oauth2|public|user|admin|books|actuator)': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
