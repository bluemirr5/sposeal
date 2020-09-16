<template>
  <div>
    <v-expansion-panels v-model="panel">
      <v-expansion-panel>
        <v-expansion-panel-header>옵션설정</v-expansion-panel-header>
        <v-expansion-panel-content>
          <div>색설정</div>

          <v-container style="padding: 0 12px">
            <v-row>
              <v-col cols="6" sm="6" style="padding: 0px">
                <div
                    @click="openColorDialog(0)"
                    style="color: white; text-align: center; padding: 5px;"
                    :style="{'background-color': outputOption.firstColor}">
                  SELECT
                </div>
                <v-text-field dense single-inline v-model.lazy="outputOption.firstColor" />
              </v-col>
              <v-col cols="6" sm="6" style="padding: 0px">
                <div
                    @click="openColorDialog(1)"
                    style="color: white; text-align: center; padding: 5px;"
                    :style="{'background-color': outputOption.secondColor}">
                  SELECT
                </div>
                <v-text-field dense single-inline v-model.lazy="outputOption.secondColor" />
              </v-col>
            </v-row>
          </v-container>
          <v-container style="padding: 0 12px">
            <v-row>
              <v-col cols="6" sm="6" style="padding: 0px">
                <span>폰트</span>
                <v-select
                    style="padding-top: 0; margin-top: 0"
                    v-model="outputOption.fontFamily"
                    :items="fonts"
                    item-text="label"
                    item-value="value"
                    hide-details
                    single-line
                ></v-select>
              </v-col>
              <v-col cols="6" sm="6" style="padding: 0px">
<!--                <span>선 종류</span>-->
<!--                <v-select-->
<!--                    style="padding-top: 0; margin-top: 0"-->
<!--                    v-model="outputOption.lineStyle"-->
<!--                    :items="lineStyles"-->
<!--                    item-text="label"-->
<!--                    item-value="value"-->
<!--                    hide-details-->
<!--                    single-line-->
<!--                ></v-select>-->
              </v-col>
            </v-row>
          </v-container>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-dialog v-model="dialogOpenFlag" width="500" >
      <v-card>

        <v-card-title class="headline grey lighten-2">

        </v-card-title>

        <v-card-text>
          <v-spacer style="margin-top: 30px"/>
          <v-color-picker
            v-model="selectedColor"
            :hide-inputs="true"
          />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions @click="dialogOpenFlag = false" style="color: white" :style="{'background-color': selectedColor}">
          <div style="text-align: center; width: 100%">OK</div>
<!--          <v-btn color="primary" text @click="dialogOpenFlag = false"> OK </v-btn>-->
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import caches from '@/common/Cache'

export default {
  name: "GPXViewOptionPicker",
  model: {
    prop: 'inputOption',
    event: 'output'
  },
  props: {
    inputOption: {type: Object, required: true},
  },
  data: () => ({
    lineStyles:[
      {label: '없음', value: null},
      {label: '타입1', value: [2, 2]},
      {label: '타입2', value: [5, 2]},
      {label: '타입3', value: [7, 7]},
    ],
    fonts: [
      {label: '김유이', value: 'kimue' },
      {label: '점꼴체', value: 'zumggolche'},
      {label: '아인맘', value: 'ainmom'},
      {label: '암스테르담', value: 'amsterdam'},
      {label: '정은체', value: 'jungeunche'}
    ],
    outputOption: null,
    inFirstColor: null,
    inSecondColor: null,
    dialogOpenFlag: false,
    panel: [0, 1],
    selectedColorIdx: -1,
    selectedColor: null
  }),
  created() {
    this.outputOption = this.inputOption
  },
  methods: {
    openColorDialog(i) {
      this.dialogOpenFlag = true
      this.selectedColorIdx = i
      if(this.selectedColorIdx === 0) {
        this.selectedColor = this.outputOption.firstColor
      } else {
        this.selectedColor = this.outputOption.secondColor
      }
    },
    selectColor() {
      if(this.selectedColorIdx === 0) {
        this.outputOption.firstColor = this.selectedColor
        caches.setFirstColor(this.selectedColor)
      } else {
        this.outputOption.secondColor = this.selectedColor
        caches.setSecondColor(this.selectedColor)
      }
    }
  },
  watch: {
    dialogOpenFlag: function(n) {
      if(!n) {
        this.selectColor()
        this.$emit('output', this.outputOption)
      }
    },
    'outputOption.fontFamily': function (n) {
      caches.setFontFamily(n)
    }
  }
}
</script>

<style scoped>

</style>