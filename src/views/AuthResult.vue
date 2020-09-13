<template>
  <div>
    인증완료!
  </div>
</template>

<script>
import authInfo from '@/common/authInfo'

export default {
  name: "AuthResult",
  created () {
    if(this.$route.query.code) {
      authInfo.code = this.$route.query.code
      authInfo.getToken().then(
        resp => {
          authInfo.setAuth(resp.data)
          this.$router.replace('/')
        },
        error => {
          alert('인증에 실패하였습니다.')
          window.console.error(error.response)
        }
      )
    }
  },
  data: () =>({
    authInfo
  })
}
</script>

<style scoped>

</style>