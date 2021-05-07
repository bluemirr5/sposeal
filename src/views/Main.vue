<template>
  <div>
    <v-dialog
        v-model="fontLoading"
        hide-overlay
        persistent
        width="300"
    >
      <v-card
          color="primary"
          dark
      >
        <v-card-text>
          폰트 로딩중 입니다 잠시만 기다려주세요.
          <v-progress-linear
              indeterminate
              color="white"
              class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <div style="padding: 0 10px">
      <div class="d-flex flex-row mb-6" style="margin-bottom: 0 !important;">
        <div class="pa-2" style="padding: 10px">
          <gpx-input @loadedGPX="loadedGPXInfo"></gpx-input>
        </div>
        <div class="pa-2">
          <strava-input @loadedGPX="loadedGPXInfo" style="margin-top: 10px;"/>
        </div>
      </div>
      <v-text-field
          style="margin: 0; padding: 0;"
          single-line
          label="제목"
          v-if="gpxInfo"
          v-model.lazy="gpxInfo.title"
      />
      <gpx-viewer-canvas
          ref="canvasViewer"
          v-if="gpxInfo"
          :title="gpxInfo.title"
          :distance="gpxInfo.distance"
          :do-time="gpxInfo.doTime"
          :line-data="gpxInfo.lineData"
          :view-option="viewOption"
      />
      <gpx-view-option-picker
          v-if="gpxInfo"
          v-model="viewOption"
      />
    </div>
    <div style="margin-top: 50px">
      <span style="font-family: kimue,serif"></span>
      <span style="font-family: ainmom,serif"></span>
      <span style="font-family: zumggolche,serif"></span>
      <span style="font-family: amsterdam,serif"></span>
      <span style="font-family: jungeunche,serif"></span>
    </div>
    <div v-if="fontLoadingErr" style="color: red">
      {{ fontLoadingErr }}
    </div>
  </div>
</template>

<script>
import stravaInput from '@/components/StravaInput'
import gpxInput from '@/components/GPXInput'
import gpxViewerCanvas from '@/components/GPXViewerCanvas'
import gpxViewOptionPicker from '@/components/GPXViewOptionPicker'
import caches from '@/common/Cache'

export default {
  name: 'Main',
  components: { stravaInput, gpxInput,  gpxViewerCanvas, gpxViewOptionPicker,}, //gpxViewer, imageInput},
  data: () => ({
    gpxInfo: null,
    viewOption: {
      svgDimensions:  100,
      lineStyle: null,
      firstColor: '#248A90', secondColor: '#EF0D0D',
      isGradation: true,
      fontFamily: 'kimue'
    },
    fab: null,
    fontLoading: true,
    fontLoadingErr: '',
  }),
  created() {
    document.fonts.onloadingdone = () => { this.fontLoading = false }
    document.fonts.onloadingerror = (e) => { this.fontLoadingErr = 'error: '+e }
    document.fonts.ready.then(() => { this.fontLoading = false })

    if(caches.getFirstColor())
      this.viewOption.firstColor = caches.getFirstColor()
    if(caches.getSecondColor())
      this.viewOption.secondColor = caches.getSecondColor()
    if(caches.getFontFamily())
      this.viewOption.fontFamily = caches.getFontFamily()
  },
  methods: {
    loadedGPXInfo(gpxInfo) { this.gpxInfo = gpxInfo },
  },
};
</script>

<style>
  @font-face {
    font-family: "kimue";
    src: url("https://firebasestorage.googleapis.com/v0/b/sposeal.appspot.com/o/kimue.ttf?alt=media&token=8177103b-c18a-4813-94ae-2c13391fa7d1") format("truetype");
  }
  @font-face {
    font-family: "ainmom";
    src: url("https://firebasestorage.googleapis.com/v0/b/sposeal.appspot.com/o/ainmom.ttf?alt=media&token=070bdb78-05c6-4f47-9d47-0fffebf00c5e") format("truetype");
  }
  @font-face {
    font-family: "zumggolche";
    src: url("https://firebasestorage.googleapis.com/v0/b/sposeal.appspot.com/o/zumggolche.ttf?alt=media&token=901a0f05-8ec0-48f5-88ea-0573576e096d") format("truetype");
  }
  @font-face {
    font-family: "amsterdam";
    src: url("https://firebasestorage.googleapis.com/v0/b/sposeal.appspot.com/o/amsterdam.ttf?alt=media&token=cb0cbeae-a5dd-4ac8-8db7-ec2a83f0cecc") format("truetype");
  }
  @font-face {
    font-family: "jungeunche";
    src: url("https://firebasestorage.googleapis.com/v0/b/sposeal.appspot.com/o/jungeunche.ttf?alt=media&token=e3d696b3-43d4-49a4-b934-70bd21079d49") format("truetype");
  }
</style>