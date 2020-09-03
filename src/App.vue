<template>
  <div id="app">
    <input type="file" @change="readFile" >
    <hr/>
    <input type="number" v-model.lazy="svgDimensions">
    <input type="number" v-model.lazy="strokeWidth">
    <div>
      Gradient
      <input type="checkbox" v-model="isGradation">
    </div>
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
    <hr/>
    <div style="text-align: left">
      <p>전체거리 : {{ distance }}km</p>
      <p>전체시간 : {{ totalTime }}</p>
      <p>운행시간 : {{ doTime }}</p>
      <p>휴식시간 : {{ restTime }}</p>
      <p>평균속도 : {{ avgSpeed }}Km/h</p>
    </div>
    <hr/>
    <div id="target" style="padding: 0px; border: 1px solid blue;text-align: left;">
    </div>
  </div>
</template>

<script>
// import { Swatches } from 'vue-color'
import { Slider } from 'vue-color'
import {SportsLib} from '@sports-alliance/sports-lib'
import moment from 'moment'
import * as d3 from 'd3'

export default {
  name: 'App',
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
      endDate:'',

      isGradation: true,
      isFirstColorPicker: false,
      isSecondColorPicker: false,

      svgDimensions:  100,
      // fontSize: this.svgDimensions/3,
      // strokeWidth: this.svgDimensions/20,
      firstColor: { 'hex': '#248A90' },
      secondColor: { 'hex': '#EF0D0D', },
      bound: { latMax:0, latMin:0, lonMax:0, lonMin:0 },
      lineData: [],
    }
  },
  created() {},
  methods: {
    readFile(f) {
      if(f.target.files[0]) {
        const selectedFile = f.target.files[0]
        const reader = new FileReader()
        reader.onload = (event) => {
          this.readGPX(event.target.result)
        };
        reader.readAsText(selectedFile);
      }

    },
    readGPX(gpxString) {
      this.lineData = []
      SportsLib.importFromGPX(gpxString).then((event)=>{
        this.endDate = moment(event.endDate).format('yyyy년 M월 D일')

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
      const svg = d3.select("#target").append("svg")
          .attr("height", this.svgDimensions)
          .attr("width", this.svgDimensions * 4)
      this.setGradation(svg)
      this.drawPath(svg)
      this.drawInfo(svg)
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
          // .attr('x', this.svgDimensions*(1+1/3)  )
          // .attr('dy', marginx)
          .attr('font-size', this.fontSize)
          .attr('font-family', 'kimue')
          .attr('font-weight', 700)
          .attr('fill', this.firstColor.hex)

      const titleText = text.append('tspan')
      titleText.attr('x', marginx)
          // .attr('x', this.svgDimensions)

          .attr('dy', this.fontSize + (this.svgDimensions-this.fontSize*3)/2.5)
          // .attr('y', (this.svgDimensions-this.fontSize*3)/2)
          .text('- ' + this.endDate)
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
    num2han(num) {
      num = parseInt((num + '').replace(/[^0-9]/g, ''), 10) + ''; // 숫자/문자/돈 을 숫자만 있는 문자열로 변환
      if (num === '0')
        return '영';
      const number = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
      const unit = ['', '만', '억', '조'];
      const smallUnit = ['천', '백', '십', ''];
      const result = []; //변환된 값을 저장할 배열
      let unitCnt = Math.ceil(num.length / 4); //단위 갯수. 숫자 10000은 일단위와 만단위 2개이다.
      num = num.padStart(unitCnt * 4, '0') //4자리 값이 되도록 0을 채운다
      const regexp = /[\w\W]{4}/g; //4자리 단위로 숫자 분리
      const array = num.match(regexp);
      //낮은 자릿수에서 높은 자릿수 순으로 값을 만든다(그래야 자릿수 계산이 편하다)
      for (let i = array.length - 1, unitCnt = 0; i >= 0; i--, unitCnt++) {
        const hanValue = _makeHan(array[i]); //한글로 변환된 숫자
        if (hanValue === '') //값이 없을땐 해당 단위의 값이 모두 0이란 뜻.
          continue;
        result.unshift(hanValue + unit[unitCnt]); //unshift는 항상 배열의 앞에 넣는다.
      }

      //여기로 들어오는 값은 무조건 네자리이다. 1234 -> 일천이백삼십사
      function _makeHan(text) {
        let str = '';
        for (let i = 0; i < text.length; i++) {
          const num = text[i];
          if (num === '0') //0은 읽지 않는다
            continue;
          str += number[num] + smallUnit[i];
        }
        return str;
      }
      return result.join('');
    }
  },
  watch: {
    svgDimensions: function() { this.drawTotal() },
    isGradation: function() { this.drawTotal() },
    firstColor: function() { this.drawTotal() },
    secondColor: function() { this.drawTotal() },
    strokeWidth: function() { this.drawTotal() }
  },
  computed: {
    fontSize () {
      return this.svgDimensions / 4
    },
    strokeWidth () {
      return this.svgDimensions / 20
    }

  }
}
</script>

<style>
@font-face {
  font-family: "kimue";
  src: url("assets/fonts/kimue.ttf") format("truetype");
}
</style>
