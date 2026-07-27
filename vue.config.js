const { defineConfig } = require('@vue/cli-service');

const backendTarget = process.env.VUE_APP_BACKEND_PROXY_TARGET || 'http://localhost:8080';

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: {
      '^/(oauth2|public|user|actuator)': {
        target: backendTarget,
        changeOrigin: true,
      },
    },
  },
});
