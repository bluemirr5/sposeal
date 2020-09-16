<template>
  <div>
    <v-btn v-if="!hasToken" @click="linkStrava" style="color: #FC5200">Strava Login</v-btn>
    <v-dialog v-else  v-model="dialog" scrollable max-width="300px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
            v-bind="attrs"
            v-on="on"
            color="#FC5200"
            dark
            @click="loadActivity"
        >
          Strava Activity
        </v-btn>
      </template>
      <v-card>
        <v-card-title style="background-color: #FC5200; color: white">Select Activity</v-card-title>
        <v-divider></v-divider>
        <v-card-text style="height: 300px;" v-if="items">
          <v-list rounded dense >
            <v-list-item-group v-model="item" color="primary">
              <v-list-item
                  v-for="(item, i) in items"
                  :key="i"
                  @click="selectActivity(item)"
              >
                <v-list-item-content style="text-align: left">
                  <v-list-item-title>
                    <span>{{ item.name }}</span>&nbsp;-&nbsp;
                    <span>{{ convertDate(item.start_date) }}</span>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
        <v-card v-else>
          <v-progress-circular
              indeterminate
              color="primary"
          ></v-progress-circular>
        </v-card>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import authInfo from '@/common/authInfo'
import moment from 'moment'
import util from "@/common/util"

export default {
  name: "StravaInput",
  data: () =>({
    authInfo,
    dialog: false,
    items: [],
    item: null,
    hasToken: false,
  }),
  created() {
    const auth = this.authInfo.getAuth()
    if(auth) {
      const expireMoment = moment(new Date(auth.expires_at*1000))
      const curMoment = moment()
      const expired = !expireMoment.isAfter(curMoment)
      this.hasToken = auth && expireMoment.isAfter(curMoment)
      if(expired) {
        this.authInfo.refreshAuth().then(() => {
          this.hasToken = !!this.authInfo.getAuth()
        }, error => {
          this.authInfo.clearAuth()
          window.console.error(error.response)
        })
      }
    }
  },
  methods: {
    linkStrava() {
      window.location.href = authInfo.authorize()
    },
    loadActivity() {
      authInfo.apiActivities().then(resp => {
        this.items = resp.data
      }, error => {
        alert('활동 데이터를 가져오지 못했습니다. ')
        window.console.error(error.response)
      })
    },
    selectActivity(item) {
      this.dialog = false
      authInfo.apiRouter(item.id).then(resp => {
        const latlng = resp.data.find(it => it.type === 'latlng')
        const lineData = latlng.data.map(it => ({x: it[0], y: it[1]}))
        const gpxData = {
          lineData,
          title: item.name,
          distance: item.distance/1000,
          avgSpeed: ( item.average_speed* 3.6),
          totalTime: util.getTime(item.elapsed_time),
          doTime: util.getTime(item.moving_time),
          restTime: util.getTime(item.elapsed_time - item.moving_time)
        }
        this.$emit('loadedGPX', gpxData)
      }, err => {
        window.console.error(err.response)
        alert('활동 데이터를 가져오지 못했습니다. ')
      })
    },
    convertDate(date) {
      return moment(date).format('M.D')
    },
  },
}
</script>

<style scoped>

</style>