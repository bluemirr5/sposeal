export default {
  host:'https://www.strava.com',
  client_id: process.env.VUE_APP_CLIENT_ID,
  client_pass: process.env.VUE_APP_CLIENT_SECRET,
  code: null,
  storage: window.localStorage,
  axios: null,
  _auth: null,
  setAuth(auth) {
    this.storage.setItem('auth', JSON.stringify(auth))
    this._auth = auth
  },
  getAuth() {
    const str = this.storage.getItem('auth')
    if(str) {
      this._auth = JSON.parse(str)
      return this._auth
    } else {
      return null
    }
  },
  refreshAuth() {
    const url = this.host + `/oauth/token?client_id=${this.client_id}` +
      `&client_secret=${this.client_pass}` +
      `&code=${this.code}` +
      `&grant_type=refresh_token` +
      `&refresh_token=${this._auth.refresh_token}`
    this.clearAuth()
    return this.axios.post(url, null).then(resp => {
      this.setAuth(resp.data)
      return resp
    })
  },
  clearAuth() {
    this.storage.setItem('auth', null)
    this._auth = null
  },
  authorize() {
    let redirectHost
    if(process.env.NODE_ENV === 'production')
      redirectHost = 'https://sposeal.web.app'
    else
      redirectHost = 'http://localhost:8080'
    return this.host + '/oauth/authorize?client_id=' +
      this.client_id + '&response_type=code&approval_prompt=auto&scope=read_all,activity:read_all&' +
      `redirect_uri=${redirectHost}/auth-result`
  },
  getReqConfig() {
    const fetchedAuth = this.getAuth('auth')
    return {
      headers: { Authorization: `Bearer ${fetchedAuth.access_token}` }
    }
  },
  getToken() {
    const url = this.host + `/oauth/token?client_id=${this.client_id}` +
      `&client_secret=${this.client_pass}` +
      `&code=${this.code}` +
      `&grant_type=authorization_code`
    return this.axios.post(url, null)
  },
  apiActivities() {
    if(this.axios) {
      const url = this.host + `/api/v3/athlete/activities`
      return this.axios.get(url, this.getReqConfig())
    }
  },
  apiRouter(id) {
    if(this.axios) {
      const url = this.host + `/api/v3/activities/${id}/streams?keys=latlng`
      return this.axios.get(url, this.getReqConfig())
    }
  }
}
