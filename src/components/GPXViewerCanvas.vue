<template>
  <div>
    <canvas ref="mcanvas" style="width: 100%; padding: 0px;"
            @mousemove="drag"
            @mousedown="isDrag = true"
            @mouseleave="isDrag = false"
            @mouseup="isDrag = false"
            @mouseout="isDrag = false"
    ></canvas>

    <v-file-input
        placeholder="Image"
        accept="image/*"
        @change="readImageFile"
    />
  </div>
</template>

<script>
export default {
  name: "GPXViewerCanvas",
  props: {
    lineData: {type: Array, required: true},
    title: {type: String, required: false, default: ''},
    distance: {type: Number, default: 0},
    doTime: {type: String, default: ''},
    viewOption: {
      type: Object,
      default: () => {
        return {
          svgDimensions: 100,
          lineStyle: '',
          firstColor: '#248A90', secondColor: '#EF0D0D',
          isGradation: true,
          fontFamily: 'kimue'
        }
      }
    },
  },
  data: () => ({
    mCanvas: null, ctx: null, targetImg: null, isDrag: false,
    position: {x: 0, y:0}
  }),
  mounted() {
    this.mCanvas = this.$refs['mcanvas']
    this.drawTotal()
  },
  methods: {
    drag(evt) {
      if(this.isDrag) {
        this.position.x = evt.offsetX * this.targetImg.naturalWidth / this.mCanvas.clientWidth
        this.position.y = evt.offsetY * this.targetImg.naturalHeight / this.mCanvas.clientHeight
        this.drawTotal(this.position.x, this.position.y)
      }
    },
    async drawTotal(x, y) {
      this.mCanvas.getContext("2d").clearRect(0, 0, this.mCanvas.width, this.mCanvas.height)
      if(this.targetImg) {
        this.mCanvas.width = this.targetImg.naturalWidth
        this.mCanvas.height = this.targetImg.naturalHeight
        await this.$nextTick()
        this.ctx = this.mCanvas.getContext('2d')
        await this.$nextTick()
        await this.drawImg(this.targetImg)
        this.$nextTick()
        await this.drawSealTotal(x, y)
      } else {
        this.mCanvas.width = this.viewOption.svgDimensions * 3.6
        this.mCanvas.height = this.viewOption.svgDimensions
        await this.$nextTick()
        this.ctx = this.mCanvas.getContext('2d')
        await this.$nextTick()
        await this.drawSealTotal()
      }
    },
    async drawSealTotal(x, y) {
      const tx = x? x : 0
      const ty = y? y : 0
      const grad = await this.makeGradation(this.ctx, this.viewOption.svgDimensions, this.viewOption.svgDimensions, tx, ty)
      await this.drawPath(this.ctx, grad, this.viewOption, tx, ty)
      const grad2 = await this.makeGradation(this.ctx, this.viewOption.svgDimensions * 2.6, this.viewOption.svgDimensions, this.viewOption.svgDimensions + tx, ty, true)
      await this.drawInfo(this.ctx, grad2, this.viewOption, tx, ty)
    },
    makeGradation(ctx, w, h, sx, sy, reverse) {
      const grad = ctx.createLinearGradient(sx, sy, sx + w, sy + h)
      if(reverse) {
        grad.addColorStop(0, this.viewOption.secondColor);
        grad.addColorStop(0.5, this.viewOption.firstColor);
      } else {
        grad.addColorStop(0, this.viewOption.firstColor);
        grad.addColorStop(1, this.viewOption.secondColor);
      }
      return grad
    },
    drawInfo(ctx, grad, viewOption, sx, sy) {
      const ax = sx ? sx : 0
      const ay = sy? sy : 0
      const marginx = viewOption.svgDimensions*(1+1/10) + ax
      if(grad) ctx.fillStyle = grad
      else ctx.fillStyle = viewOption.firstColor

      ctx.font = '700 ' + this.fontSize+'px ' + viewOption.fontFamily
      ctx.fillText(this.title, marginx, this.fontSize * 1 + (viewOption.svgDimensions-this.fontSize*3)/2.5 + ay)
      ctx.fillText('- ' + this.distance.toFixed(2) + 'Km', marginx, this.fontSize * 2 + (viewOption.svgDimensions-this.fontSize*3)/2.5 + ay)
      ctx.fillText('- ' + this.doTime, marginx, this.fontSize * 3 + (viewOption.svgDimensions-this.fontSize*3)/2.5 + ay)
    },
    drawPath(ctx, grad, viewOption, sx, sy) {
      const ax = sx ? sx : 0
      const ay = sy? sy : 0
      ctx.beginPath()
      ctx.lineWidth = this.strokeWidth
      if(grad) ctx.strokeStyle = grad
      else ctx.strokeStyle = viewOption.firstColor

      //원 그리기
      const center = viewOption.svgDimensions / 2
      ctx.arc(center + ax, center + ay, center - this.strokeWidth, 0, Math.PI * 2, true)
      ctx.stroke()

      // 경로 그리기
      const pathDimension = viewOption.svgDimensions / 2  // 실제 경로의 크기
      const tr = (viewOption.svgDimensions - pathDimension) / 2 - this.strokeWidth / 2 // 실제 경로의 시작점
      let tx, ty, firstFlag = true
      this.lineData.forEach(it => {
        tx = ( it.x - this.bound.xMin) / (this.bound.xMax - this.bound.xMin)  * pathDimension + tr + ax
        ty = ( 1 - (it.y - this.bound.yMin) / (this.bound.yMax - this.bound.yMin) ) * pathDimension + tr + ay
        if(firstFlag){
          ctx.moveTo(tx, ty)
          firstFlag = false
        } else {
          ctx.lineTo(tx, ty)
          ctx.moveTo(tx - 1, ty - 1)
        }
      })
      ctx.stroke()
      ctx.closePath()
    },
    readImageFile(imgFile) {
      const imgObj = new Image();
      const reader = new FileReader()
      reader.onload = async (event) => {
        imgObj.src = event.target.result
        await this.$nextTick()
        this.targetImg = imgObj
        await this.drawTotal()
      }
      if(imgFile) reader.readAsDataURL(imgFile)
    },
    async drawImg(targetImage) {
      this.ctx.drawImage(targetImage, 0, 0)
      await this.$nextTick()
      const longEdge = Math.max(this.mCanvas.width, this.mCanvas.height)
      this.viewOption.svgDimensions = longEdge/5
    }
  },
  computed: {
    fontSize () { return this.viewOption.svgDimensions / 4 },
    strokeWidth () { return this.viewOption.svgDimensions / 25 },
    bound () {
      if(!this.lineData) return { xMin: 0, xMax: 0, yMin: 0, yMax: 0, }
      const xArray = this.lineData.map(it => it.x)
      const yArray = this.lineData.map(it => it.y)
      return {
        xMin: Math.min.apply(null, xArray), xMax: Math.max.apply(null, xArray),
        yMin: Math.min.apply(null, yArray), yMax: Math.max.apply(null, yArray),
      }
    }
  },
  watch: {
    lineData: function() { this.drawTotal(this.position.x, this.position.y) },
    title: function () { this.drawTotal(this.position.x, this.position.y) },
    viewOption: {
      deep: true,
      handler: function() { this.drawTotal(this.position.x, this.position.y) }
    }
  }
}
</script>

<style scoped></style>