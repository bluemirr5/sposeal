<template>
  <div>
    <div style="padding: 0 10px">
      <v-btn @click="linkStrava">Strava</v-btn>
      <gpx-input @loadedGPX="loadedGPXInfo"></gpx-input>
      <v-text-field
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
          @downloadable="downloadChange"
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
  </div>
</template>

<script>
import gpxInput from '@/components/GPXInput'
import gpxViewerCanvas from '@/components/GPXViewerCanvas'
import gpxViewOptionPicker from '@/components/GPXViewOptionPicker'

export default {
  name: 'Main',
  components: { gpxInput,  gpxViewerCanvas, gpxViewOptionPicker,}, //gpxViewer, imageInput},
  data: () => ({
    gpxInfo: null,
    viewOption: {
      svgDimensions:  100,
      lineStyle: null,
      firstColor: '#248A90', secondColor: '#EF0D0D',
      isGradation: true,
      fontFamily: 'kimue'
    },
    svg: null,
    isDownload: false
  }),
  methods: {
    linkStrava() {

    },
    loadedGPXInfo(gpxInfo) { this.gpxInfo = gpxInfo },
    downloadChange(flag) { this.isDownload = flag },
    download() { this.$refs['canvasViewer'].download() }
  }
};
</script>

<style>
  @font-face { font-family: "kimue"; src: url("../assets/fonts/kimue.ttf") format("truetype"); }
  @font-face { font-family: "ainmom"; src: url("../assets/fonts/ainmom.ttf") format("truetype"); }
  @font-face { font-family: "zumggolche"; src: url("../assets/fonts/zumggolche.ttf") format("truetype"); }
  @font-face { font-family: "amsterdam"; src: url("../assets/fonts/amsterdam.ttf") format("truetype"); }
  @font-face { font-family: "jungeunche"; src: url("../assets/fonts/jungeunche.ttf") format("truetype"); }
</style>