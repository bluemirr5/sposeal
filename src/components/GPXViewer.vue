<template>
  <div>
<!--    <div>-->
<!--      <p>{{ title }}</p>-->
<!--      <p>{{ lineData.length }}</p>-->
<!--      <p>{{ distance }}</p>-->
<!--      <p>{{ doTime }}</p>-->
<!--    </div>-->
    <div id="target"></div>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: 'GPXViewer',
  props: {
    lineData: { type: Array, required: true},
    title: { type: String, required: false, default: ''},
    distance: { type: Number, default: 0},
    doTime: { type: String, default: ''},
    viewOption: {
      type: Object,
      default: () => { return {
        svgDimensions:  100,
        lineStyle: '',
        firstColor: '#248A90', secondColor: '#EF0D0D',
        isGradation: true,
        fontFamily: 'kimue'
      } }
    },
  },
  data: () => ({
    svg: null,
  }),
  created() { },
  mounted() {
    this.drawTotal()
  },
  methods: {
    drawTotal() {
      d3.select("#target svg").remove()
      this.svg = d3.select("#target").append("svg")
          .attr("height", this.viewOption.svgDimensions)
          .attr("width", this.viewOption.svgDimensions * 3.6)
          .attr('font-family', this.viewOption.fontFamily)
      this.setGradation(this.svg)
      this.drawPath(this.svg)
      this.drawInfo(this.svg)

      const xml = new XMLSerializer().serializeToString(this.svg.node());
      this.$emit('drawComplete', xml)
    },
    setGradation(svg) {
      // 그라데이션 컬러
      const defs = svg.append("defs");
      const linearGradient = defs.append("linearGradient")
          .attr("id", "linear-gradient");
      linearGradient.attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "100%");
      linearGradient.append("stop").attr("offset", "0%").attr("stop-color", this.viewOption.firstColor); //light blue
      linearGradient.append("stop").attr("offset", "100%").attr("stop-color", this.viewOption.secondColor); //dark blue
    },
    drawPath(svg) {
      // 경로 그리기
      const pathDimension = this.viewOption.svgDimensions / 2  // 실제 경로의 크기
      const getX = (x) => ( x - this.bound.xMin) / (this.bound.xMax - this.bound.xMin)  * pathDimension
      const getY = (y) => ( 1 - (y - this.bound.yMin) / (this.bound.yMax - this.bound.yMin) ) * pathDimension
      const lineFunction = d3.line().x((d) => getX(d.x)).y((d) => getY(d.y)).curve(d3.curveLinear);
      const tr = (this.viewOption.svgDimensions - pathDimension) / 2 - this.strokeWidth / 2 // 실제 경로의 시작점
      const path = svg.append("path")
      path.style("stroke-width", this.strokeWidth)
          .style("fill", "none")
          .attr("d", lineFunction(this.lineData))
          .attr("transform", "translate(" + tr + "," + tr + ")")
      if(this.viewOption.lineStyle)
        path.style("stroke-dasharray", this.viewOption.lineStyle)
      if(this.viewOption.isGradation) path.style("stroke", "url(#linear-gradient)")
      else path.style("stroke", this.viewOption.firstColor)

      // 경로 원 그리기
      const circlePosition =  this.viewOption.svgDimensions / 2
      const circle = svg.append("circle")
      circle.attr("cx", circlePosition).attr("cy", circlePosition)
          .attr("r", (this.viewOption.svgDimensions - 2 * this.strokeWidth)/2)
          .style("stroke-width", this.strokeWidth)
          .style("stroke", "url(#linear-gradient)")
          .style("fill", "none")
      if(this.viewOption.lineStyle)
        circle.style("stroke-dasharray", this.viewOption.lineStyle)
      if(this.viewOption.isGradation) circle.style("stroke", "url(#linear-gradient)")
      else circle.style("stroke", this.viewOption.firstColor)
    },
    drawInfo(svg) {
      const marginx = this.viewOption.svgDimensions*(1+1/10)
      const text = svg.append('text')
          .attr('font-size', this.fontSize)
          .attr('font-family', this.viewOption.fontFamily)
          .attr('font-weight', 700)
          .attr('fill', this.viewOption.firstColor)

      text.append('tspan').attr('x', marginx)
          .attr('dy', this.fontSize + (this.viewOption.svgDimensions-this.fontSize*3)/2.5)
          .text(this.title)
      text.append('tspan').attr('x', marginx)
          .attr('dy', this.fontSize)
          .text('- ' + this.distance.toFixed(2) + 'Km')
      text.append('tspan').attr('x', marginx)
          .attr('dy', this.fontSize)
          .text('- ' + this.doTime)
      if(this.viewOption.isGradation) text.attr('fill', "url(#linear-gradient)")
      else text.attr('fill', this.viewOption.firstColor)
    },
  },
  computed: {
    fontSize () { return this.viewOption.svgDimensions / 4 },
    strokeWidth () { return this.viewOption.svgDimensions / 25 },
    bound () {
      if(!this.lineData) return { xMin: 0, xMax: 0, yMin: 0, yMax: 0, }
      const xArray = this.lineData.map(it => it.x)
      const yArray = this.lineData.map(it => it.y)
      return {
        xMin: Math.min.apply(null, xArray),
        xMax: Math.max.apply(null, xArray),
        yMin: Math.min.apply(null, yArray),
        yMax: Math.max.apply(null, yArray),
      }
    }
  },
  watch: {
    lineData: function() { this.drawTotal() },
    title: function () { this.drawTotal() },
    viewOption: {
      deep: true,
      handler: function() { this.drawTotal() }
    }
  }
}
</script>

<style scoped>

</style>