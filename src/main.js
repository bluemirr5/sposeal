import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import Vue2TouchEvents from 'vue2-touch-events';
import router from './router'

Vue.config.productionTip = false
Vue.use(Vue2TouchEvents)

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
