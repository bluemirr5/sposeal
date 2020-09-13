export default {
  host:'https://www.strava.com',
  client_id: '53545',
  client_pass: '421b33f96904dc8b3f0da735194f977ef4d26d65',
  code: null,
  auth: null,
  axios: null,
  authorize() {
    return this.host + '/oauth/authorize?client_id=' +
      this.client_id + '&response_type=code&approval_prompt=auto&scope=read_all,activity:read_all&' +
      'redirect_uri=http://localhost:8080/auth-result'
  },
  getReqConfig() {
    return {
      headers: { Authorization: `Bearer ${this.auth.access_token}` }
    }
  },
  getToken() {
    const url = this.host + `/oauth/token?client_id=${this.client_id}` +
      `&client_secret=${this.client_pass}` +
      `&code=${this.code}` +
      `&grant_type=authorization_code`
    window.console.log(url)
    return this.axios.post(url, null)
  },
  apiActivities() {
    if(this.axios) {
      const url = this.host + `/api/v3/athlete/activities`
      window.console.log(url)
      return this.axios.get(url, this.getReqConfig())
    }
  },
  apiRouter(id) {
    if(this.axios) {
      const url = this.host + `/api/v3/activities/${id}/streams?keys=latlng`
      window.console.log(url)
      return this.axios.get(url, this.getReqConfig())
    }
  }
}

/*

      let url = 'http://www.strava.com/oauth/authorize?client_id='
      url += '53545&response_type=code&approval_prompt=auto&scope=read&'
      url += 'redirect_uri=http://localhost:8080/auth-result'
 */
