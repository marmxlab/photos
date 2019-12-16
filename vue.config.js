module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000/',
      },
      '/thumbnails': {
        target: 'http://localhost:3000/',
      },
      '/images': {
        target: 'http://localhost:3000/',
      },
    }
  },
  "transpileDependencies": [
    "vuetify"
  ]
}
