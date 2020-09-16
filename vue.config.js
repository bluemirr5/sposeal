module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    https: true
  },
  pwa: {
    name: 'Spo Seal',
    short_name: 'SPOSEAL',
    description: 'Sports Seal',
    themeColor: '#1976d2',
    msTileColor: '#FFFFFF',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'blacK',
    start_url: '/?source=pwa',
    display: 'standalone',

    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/sw.js',
    }
  }
}