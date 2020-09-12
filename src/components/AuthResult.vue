<template>
  <div>
    result
  </div>
</template>

<script>
export default {
  name: "AuthResult",
  created () {
    console.log(this.$route.query)
  }
}
</script>

<style scoped>

</style>