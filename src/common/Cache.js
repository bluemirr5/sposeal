export default {
  storage: window.localStorage,
  getFirstColor() {
    if(this.storage)
      return this.storage.getItem('firstColor')
    else return null
  },
  setFirstColor(color) {
    if(this.storage)
      this.storage.setItem('firstColor', color)
  },
  getSecondColor() {
    if(this.storage)
      return this.storage.getItem('secondColor')
    else return null
  },
  setSecondColor(color) {
    if(this.storage)
      this.storage.setItem('secondColor', color)
  },
  getFontFamily() {
    if(this.storage)
      return this.storage.getItem('fontFamily')
    else return null
  },
  setFontFamily(font) {
    if(this.storage)
      this.storage.setItem('fontFamily', font)
  }
}
