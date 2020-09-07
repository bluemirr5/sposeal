<template>
  <div id="app">
    <!--      <div class="d-flex align-center">-->
    <!--        <v-img alt="Vuetify Logo" class="shrink mr-2" contain transition="scale-transition" width="40"-->
    <!--          src="https://cdn.vuetifyjs.com/images/logos/vuetify-logo-dark.png"-->
    <!--        />-->
    <!--        <v-img alt="Vuetify Name" class="shrink mt-1 hidden-sm-and-down" contain min-width="100" width="100"-->
    <!--          src="https://cdn.vuetifyjs.com/images/logos/vuetify-name-dark.png"-->
    <!--        />-->
    <!--      </div>-->
    <!--      <v-spacer></v-spacer>-->
    <!--      <v-btn target="_blank" text-->
    <!--        href="https://github.com/vuetifyjs/vuetify/releases/latest"-->
    <!--      >-->
    <!--        <span class="mr-2">Latest Release</span> <v-icon>mdi-open-in-new</v-icon>-->
    <!--      </v-btn>-->
    <input type="file" @change="readGPXFile" >
    <input type="file" @change="readImageFile" >
    <hr/>
    <div>
      <div>
        <input type="text" v-model.lazy="title" maxlength="10">
      </div>
      <div>
        Gradient
        <input type="checkbox" v-model="isGradation">
        <div>
          <template v-if="isGradation">
            <div style="margin-bottom: 25px">
              <chrome-color v-model="firstColor" style="width: 100%"></chrome-color>
            </div>
            <div>
              <chrome-color v-model="secondColor" style="width: 100%"></chrome-color>
            </div>
          </template>
          <template v-else>
            <div>
              <chrome-color v-model="firstColor" style="width: 100%"></chrome-color>
            </div>
          </template>
        </div>
      </div>
      <div>
        <select v-model="lineStyle">
          <option value="">없음</option>
          <option value="2, 2">타입1</option>
          <option value="5, 2">타입2</option>
          <option value="7, 7">타입3</option>
        </select>
      </div>
      <div>
        <select v-model="fontFamily">
          <option value="kimue">김유이</option>
          <option value="ainmom">아인맘</option>
          <option value="zumggolche">점꼴체</option>
          <option value="amsterdam">암스테르담</option>
          <option value="jungeunche">정은체</option>
        </select>
      </div>
    </div>
    <hr/>
    <div style="display: none">
      <input type="number" v-model.lazy="svgDimensions">
      <input type="number" v-model.lazy="strokeWidth">
      <div style="text-align: left">
        <p>전체거리 : {{ distance }}km</p>
        <p>전체시간 : {{ totalTime }}</p>
        <p>운행시간 : {{ doTime }}</p>
        <p>휴식시간 : {{ restTime }}</p>
        <p>평균속도 : {{ avgSpeed }}Km/h</p>
      </div>
      <hr/>
    </div>
    <div id="target" style="padding: 0px; border: 1px solid blue;text-align: left;"></div>
    <br /> <br /> <br /> <br />
    <button @click="download">1111:</button>
    <br /> <br /> <br /> <br />
    <canvas ref="mcanvas" style="display:none; padding: 0px; border: 1px solid blue;text-align: left;"></canvas>
  </div>
</template>

<script>
// import { Swatches } from 'vue-color'
import { Slider } from 'vue-color'
import {SportsLib} from '@sports-alliance/sports-lib'
import moment from 'moment'
import * as d3 from 'd3'

export default {
  name: 'App2',
  components: {
    // 'chrome-color': Swatches,
    'chrome-color': Slider
  },
  data() {
    return {
      distance: 0,
      totalTime: '',
      doTime: '',
      restTime: '',
      avgSpeed: 0,
      title:'',
      lineStyle: '',
      fontFamily: 'kimue',

      svg: null,
      canvas: null,

      isGradation: true,
      isFirstColorPicker: false,
      isSecondColorPicker: false,

      svgDimensions:  100,
      firstColor: { 'hex': '#248A90' },
      secondColor: { 'hex': '#EF0D0D', },
      bound: { latMax:0, latMin:0, lonMax:0, lonMin:0 },
      lineData: [],
    }
  },
  created() {},
  mounted() {
    this.canvas = this.$refs['mcanvas']
  },
  methods: {
    readGPXFile(f) {
      if(f.target.files[0]) {
        const selectedFile = f.target.files[0]
        const reader = new FileReader()
        reader.onload = (event) => {
          this.readGPX(event.target.result)
        };
        reader.readAsText(selectedFile);
      }
    },
    readImageFile(f) {
      const imageFile = f.target.files[0]
      if(imageFile) {
        const imgObj = new Image();
        const reader = new FileReader()
        reader.onload = (event) => {
          this.canvas.id = "totalLayer"
          imgObj.src = event.target.result
          this.$nextTick(() => {
            console.log(imgObj.naturalWidth)
            console.log(imgObj.naturalHeight)
            this.canvas.width = imgObj.naturalWidth
            this.canvas.height = imgObj.naturalHeight
            this.$nextTick(() => {
              console.log(this.canvas.width)
              console.log(this.canvas.height)
              const context = this.canvas.getContext("2d");
              context.drawImage(imgObj, 0, 0)
              this.$nextTick(() => {
                const context = this.canvas.getContext("2d");
                const xml = new XMLSerializer().serializeToString(this.svg.node());
                // make it base64
                const svg64 = btoa(unescape(encodeURIComponent(xml)))
                const b64Start = 'data:image/svg+xml;base64,';
                // prepend a "header"
                const image64 = b64Start + svg64;
                const svgImgObj = new Image();
                svgImgObj.onload = (evt) => {
                  context.drawImage(evt.target, 0, 0)
                }
                svgImgObj.src = image64
              })
            })
          })
        }
        reader.readAsDataURL(imageFile)
      }
    },
    download() {
      let dataURL = this.canvas.toDataURL('image/png');
      dataURL = dataURL.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');
      dataURL = dataURL.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');
      const aTag = document.createElement('a');
      aTag.download = 'from_canvas.png';
      aTag.href = dataURL;
      aTag.click();
    },
    readGPX(gpxString) {
      this.lineData = []
      SportsLib.importFromGPX(gpxString).then((event)=>{
        this.title = moment(event.endDate).format('yyyy년 M월 D일')

        this.distance = (event.getDistance().getValue()/1000).toFixed(2)
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

        for (let i = 0; i < totalLongitude.length; i++) {
          const it = {x: totalLongitude[i], y: totalLatitude[i]}
          if(it.x != null && it.y != null && it.x !== 0 && it.y !== 0)
            this.lineData.push(it)
        }
        const filterLon = this.lineData.map(it => it.x)
        const filterLat = this.lineData.map(it => it.y)

        this.bound.latMax = Math.max.apply(null, filterLat)
        this.bound.latMin = Math.min.apply(null, filterLat)
        this.bound.lonMax = Math.max.apply(null, filterLon)
        this.bound.lonMin = Math.min.apply(null, filterLon)

        this.avgSpeed = (event.getDistance().getValue() / this.lineData.length * 3.6).toFixed(2)

        this.totalTime = this.getTime(totalLatitude.length)
        this.doTime = this.getTime(this.lineData.length)
        this.restTime = this.getTime(totalLatitude.length - this.lineData.length)

        this.drawTotal()
      })
    },
    drawTotal() {
      d3.select("#target svg").remove()
      this.svg = d3.select("#target").append("svg")
          .attr("height", this.svgDimensions)
          .attr("width", this.svgDimensions * 4)
      this.setGradation(this.svg)
      this.drawPath(this.svg)
      this.drawInfo(this.svg)
    },
    setGradation(svg) {
      // 그라데이션 컬러
      const defs = svg.append("defs");
      const linearGradient = defs.append("linearGradient")
          .attr("id", "linear-gradient");
      linearGradient.attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%");
      linearGradient.append("stop").attr("offset", "0%").attr("stop-color", this.firstColor.hex); //light blue
      linearGradient.append("stop").attr("offset", "100%").attr("stop-color", this.secondColor.hex); //dark blue
    },
    drawInfo(svg) {
      const text = svg.append('text')

      const marginx = this.svgDimensions*(1+1/10)
      text
          .attr('x', this.svgDimensions*(1+1/3)  )
          // .attr('dy', marginx)
          .attr('font-size', this.fontSize)
          .attr('font-family', this.fontFamily)
          .attr('font-weight', 700)
          .attr('fill', this.firstColor.hex)

      const titleText = text.append('tspan')
      titleText.attr('x', marginx)
          // .attr('x', this.svgDimensions)

          .attr('dy', this.fontSize + (this.svgDimensions-this.fontSize*3)/2.5)
          // .attr('y', (this.svgDimensions-this.fontSize*3)/2)
          .text(this.title)
      const firstText = text.append('tspan')
      firstText.attr('x', marginx)
          // .attr('x', this.svgDimensions)
          .attr('dy', this.fontSize)
          .text('- ' + this.distance + 'Km')
      const secondText = text.append('tspan')
      secondText.attr('x', marginx)
          // .attr('x', this.svgDimensions)
          .attr('dy', this.fontSize)
          .text('- ' + this.doTime)

      if(this.isGradation) text.attr('fill', "url(#linear-gradient)")
      else text.attr('fill', this.firstColor.hex)
    },
    drawPath(svg) {
      // 경로 그리기
      const pathDimension = this.svgDimensions/2  // 실제 경로의 크기
      const getX = (x) =>
          ( x - this.bound.lonMin) / (this.bound.lonMax - this.bound.lonMin)  * pathDimension
      const getY = (y) =>
          ( 1 - (y - this.bound.latMin) / (this.bound.latMax - this.bound.latMin) ) * pathDimension
      const lineFunction = d3.line().x((d) => getX(d.x)).y((d) => getY(d.y)).curve(d3.curveLinear);
      const tr = (this.svgDimensions - pathDimension) / 2 - this.strokeWidth / 2 // 실제 경로의 시작점
      const path = svg.append("path")
      path.style("stroke-width", this.strokeWidth)
        .style("fill", "none")
        .attr("d", lineFunction(this.lineData))
        .attr("transform", "translate(" + tr + "," + tr + ")")

      if(this.lineStyle)
        path.style("stroke-dasharray", this.lineStyle)
      if(this.isGradation) path.style("stroke", "url(#linear-gradient)")
      else path.style("stroke", this.firstColor.hex)

      // 경로 원 그리기
      const circlePosition =  this.svgDimensions / 2
      const circle = svg.append("circle")
      circle.attr("cx", circlePosition).attr("cy", circlePosition)
          .attr("r", (this.svgDimensions - 2 * this.strokeWidth)/2)
          .style("stroke-width", this.strokeWidth)
          .style("stroke", "url(#linear-gradient)")
          .style("fill", "none")

      if(this.lineStyle)
        circle.style("stroke-dasharray", this.lineStyle)
      if(this.isGradation) circle.style("stroke", "url(#linear-gradient)")
      else circle.style("stroke", this.firstColor.hex)
    },
    getTime(second) {
      // const format = second >= 86400 ? 'D일 H시간 m분' : 'H시간 m분 s초'
      let format
      if(second >= 86400) format = 'D일 H시간 m분'
      else if(second > 3600) format = 'H시간 m분 s초'
      else format = 'm분 s초'
      return moment(0).startOf('day')
          .seconds(second)
          .format(format);
    },
  },
  watch: {
    svgDimensions: function() { this.drawTotal() },
    isGradation: function() { this.drawTotal() },
    firstColor: function() { this.drawTotal() },
    secondColor: function() { this.drawTotal() },
    strokeWidth: function() { this.drawTotal() },
    lineStyle: function() { this.drawTotal() },
    fontFamily: function() { this.drawTotal() },
    title: function() { this.drawTotal() }
  },
  computed: {
    fontSize () { return this.svgDimensions / 4 },
    strokeWidth () { return this.svgDimensions / 25 }
  }
}
</script>

<style>
@font-face { font-family: "kimue"; src: url("assets/fonts/kimue.ttf") format("truetype"); }
@font-face { font-family: "ainmom"; src: url("assets/fonts/ainmom.ttf") format("truetype"); }
@font-face { font-family: "zumggolche"; src: url("assets/fonts/zumggolche.ttf") format("truetype"); }
@font-face { font-family: "amsterdam"; src: url("assets/fonts/amsterdam.ttf") format("truetype"); }
@font-face { font-family: "jungeunche"; src: url("assets/fonts/jungeunche.ttf") format("truetype"); }
</style>
