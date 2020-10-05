module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://www.hd-wallet.com:8000',
        ws: true,
        changeOrigin: true
      }
    }
  }
}
