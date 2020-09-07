<template>
  <div class="gpx-input-total">
    <span>GPX</span>
    <v-file-input
        accept="application/gpx+xml"
        @change="readGPXFile"> </v-file-input>
  </div>
</template>

<script>
import {SportsLib} from '@sports-alliance/sports-lib'
import moment from 'moment'
import util from '@/common/util'

export default {
  name: "GPXInput",
  methods: {
    readGPXFile(f) {
      console.log(f.type)
      if(f) {
        if(f.type !== 'application/gpx+xml') {
          alert('gpx 파일형식만 가능합니다.')
          return
        }
        const reader = new FileReader()
        reader.onload = (event) => {
          this.readGPX(event.target.result)
        }
        reader.readAsText(f)
      }
    },
    readGPX(gpxString) {
      SportsLib.importFromGPX(gpxString).then((event)=>{
        let totalLatitude = []
        let totalLongitude = []
        let totalAltitude = []
        event.getActivities().forEach(activity => {
          const allStream = activity.getAllStreams()
          const latitude = allStream.find(stream => stream.type === 'Latitude')
          totalLatitude = totalLatitude.concat(latitude.getData())
          const longitude = allStream.find(stream => stream.type === 'Longitude')
          totalLongitude = totalLongitude.concat(longitude.getData())
          const altitude = allStream.find(stream => stream.type === 'Altitude')
          totalAltitude = totalAltitude.concat(altitude.getData())
        })

        if(totalLatitude.length !== totalLongitude.length && totalLongitude.length !== totalAltitude.length)
          return { state: -1, msg: 'wrong gpx'}

        const lineData = totalLatitude.map((it, i) => {
            return { x: totalLongitude[i], y: it, z: totalAltitude[i]}
          }).filter(it => it.x != null)
        const gpxData = {
          lineData,
          title: moment(event.endDate).format('yyyy년 M월 D일'),
          distance: (event.getDistance().getValue()/1000),
          avgSpeed: (event.getDistance().getValue() / lineData.length * 3.6),
          totalTime: util.getTime(totalLatitude.length),
          doTime: util.getTime(lineData.length),
          restTime: util.getTime(totalLatitude.length - lineData.length)
        }
        this.$emit('loadedGPX', gpxData)
      })
    },
  }
}
</script>

<style scoped>
.gpx-input-total {
  padding: 10px;
}
</style>