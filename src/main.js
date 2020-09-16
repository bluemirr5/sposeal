import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import Vue2TouchEvents from 'vue2-touch-events'
import router from './router'
import axios from 'axios'
import authInfo from '@/common/authInfo'

import './registerServiceWorker'

// Configure OAuth2 access token for authorization: strava_oauth

Vue.prototype.$http = axios
authInfo.axios = axios
Vue.config.productionTip = false
Vue.use(Vue2TouchEvents)

new Vue({
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app')
