<template>
  <div class="image-input-total">
    <v-file-input
        placeholder="Image"
        accept="image/*"
        @change="readImageFile"
    > </v-file-input>
    <canvas ref="mcanvas" style="width: 100%; padding: 0px;">
    </canvas>
  </div>
</template>

<script>
export default {
  name: "ImageInput",
  props: {
    svgXml: { type: String, required: true}
  },
  data: () =>({
    canvas: null,
    targetImage: null,
  }),
  mounted() {
    this.canvas = this.$refs['mcanvas']
  },
  methods: {
    onload2promise(obj){
      return new Promise((resolve, reject) => {
        obj.onload = () => resolve(obj)
        obj.onerror = reject
      })
    },
    async drawImgSvg() {
      this.canvas.id = "totalLayer"
      this.canvas.width = this.targetImage.naturalWidth
      this.canvas.height = this.targetImage.naturalHeight
      await this.$nextTick()
      const context = this.canvas.getContext("2d");
      context.drawImage(this.targetImage, 0, 0)
      await this.$nextTick()

      // make it base64
      const svg64 = btoa(unescape(encodeURIComponent(this.svgXml)))
      // prepend a "header"
      const image64 = 'data:image/svg+xml;base64,' + svg64;
      const svgImgObj = new Image();
      let imgpromise = this.onload2promise(svgImgObj); // see comment of T S why you should do it this way.
      svgImgObj.src = image64
      await imgpromise
      await this.$nextTick()
      const rateWidth = this.targetImage.naturalWidth
      const sw = svgImgObj.width
      const sh = svgImgObj.height
      context.font = "26pt kimue";
      context.drawImage(svgImgObj, 0, 0, rateWidth, rateWidth*sh/sw)
    },
    readImageFile(imgFile) {
      const imgObj = new Image();
      const reader = new FileReader()
      reader.onload = async (event) => {
        imgObj.src = event.target.result
        await this.$nextTick()
        this.targetImage = imgObj
        await this.drawImgSvg()
      }
      reader.readAsDataURL(imgFile)
    }
  },
  watch: {
    // svgXml: function () {
    //   this.drawImgSvg()
    // }
  }
}
</script>

<style scoped>
.image-input-total {}
</style>