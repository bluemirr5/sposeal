<template>
  <v-app>
    <v-app-bar app color="primary" dark > SpoSeal </v-app-bar>
    <v-main >
      <div  style="padding: 0 10px">
        <gpx-input @loadedGPX="loadedGPXInfo"></gpx-input>
        <gpx-view-option-picker
            v-if="gpxInfo"
            v-model="viewOption"
        />
        <v-text-field
            single-line
            style="margin-top: 20px;"
            label="제목"
            v-if="gpxInfo"
            v-model.lazy="gpxInfo.title"
        />
        <v-spacer></v-spacer>
        <gpx-viewer-canvas
            v-if="gpxInfo"
            :title="gpxInfo.title"
            :distance="gpxInfo.distance"
            :do-time="gpxInfo.doTime"
            :line-data="gpxInfo.lineData"
            :view-option="viewOption"
        />
<!--        <gpx-viewer-->
<!--            v-if="gpxInfo"-->
<!--            :title="gpxInfo.title"-->
<!--            :distance="gpxInfo.distance"-->
<!--            :do-time="gpxInfo.doTime"-->
<!--            :line-data="gpxInfo.lineData"-->
<!--            :view-option="viewOption"-->
<!--            @drawComplete="loadedSVG"-->
<!--        />-->
<!--        <image-input-->
<!--            v-if="gpxInfo && svg"-->
<!--            :svg-xml="svg"-->
<!--        />-->
        <!--            :svg="svg"-->
      </div>
      <div>
        <span style="font-family: kimue,serif"></span>
        <span style="font-family: ainmom,serif"></span>
        <span style="font-family: zumggolche,serif"></span>
        <span style="font-family: amsterdam,serif"></span>
        <span style="font-family: jungeunche,serif"></span>
      </div>
    </v-main>
  </v-app>
</template>

<script>
import gpxInput from '@/components/GPXInput'
// import gpxViewer from '@/components/GPXViewer'
import gpxViewerCanvas from '@/components/GPXViewerCanvas'
import gpxViewOptionPicker from '@/components/GPXViewOptionPicker'
// import imageInput from '@/components/ImageInput'

export default {
  name: 'App',
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
    svg: null
  }),
  methods: {
    loadedGPXInfo(gpxInfo) {
      this.gpxInfo = gpxInfo
    },
    loadedSVG(svg) {
      this.svg = svg
    }
  }
};
</script>

<style>
  @font-face { font-family: "kimue"; src: url("assets/fonts/kimue.ttf") format("truetype"); }
  @font-face { font-family: "ainmom"; src: url("assets/fonts/ainmom.ttf") format("truetype"); }
  @font-face { font-family: "zumggolche"; src: url("assets/fonts/zumggolche.ttf") format("truetype"); }
  @font-face { font-family: "amsterdam"; src: url("assets/fonts/amsterdam.ttf") format("truetype"); }
  @font-face { font-family: "jungeunche"; src: url("assets/fonts/jungeunche.ttf") format("truetype"); }
</style>