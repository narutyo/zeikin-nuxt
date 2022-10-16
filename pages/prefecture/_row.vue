<template>
  <v-container>
    <v-row>
      <v-col cols="4">
        <v-select
          v-model="city_row"
          :items="cities"
          label="都市別"
          clearable
          @change="setCity"
          @click:clear="clearCity"
        />
      </v-col>
      <v-col cols="4">
        <v-select
          v-model="municipality_row"
          :items="municipalities"
          label="町村別"
          clearable
          @change="setMunicipality"
          @click:clear="clearMunicipality"
        />
      </v-col>
    </v-row>
    <div style="width: 600px">
      <bar
        v-if="show"
        :chartdata="chartData"
        :options="chartOptions"
        :items="items"
      ></bar>
      <v-skeleton-loader
        v-else
        width="600px"
        height="500px"
        type="article, article, article, article"
      ></v-skeleton-loader>
      <polar
        v-if="show"
        :chartdata="chartData"
        :options="chartOptions"
        :items="items"
      ></polar>
      <v-skeleton-loader
        v-else
        width="600px"
        height="500px"
        type="image, image, image, image"
      ></v-skeleton-loader>
    </div>
    <v-treeview
      :items="items"
    ></v-treeview>
    <graph-details />
  </v-container>
</template>

<script>
import GraphDetails from '~/components/Graph/Details.vue'
import Bar from '~/components/Graph/Bar.vue'
import Polar from '~/components/Graph/Polar.vue'

export default {
  name: 'PrefectureNum',
  components: {
    GraphDetails,
    Bar,
    Polar
  },
  data (context) {
    return {
      show: false,
      cities: [],
      municipalities: [],

      year: null,
      prefectureCode: null,
      prefecture_row: null,
      city_row: null,
      municipality_row: null,

      sheetRow: [],
      expenditure: {},
      groupSetting: context.$const.groupSetting,

      items: [],
      sum: 0,
      delay: 0,
      stracture: {},

      groupSum: {},
      chartData: {
        labels: [],
        datasets: [{
          label: '目的別歳出',
          data: []
        }]
      },
      chartOptions: {
        responsive: true,
        scales: {
          r: {
            pointLabels: {
              display: true,
              centerPointLabels: true,
              font: {
                size: 18
              }
            }
          }
        }
      }
    }
  },
  async mounted () {
    this.prefecture_row = Number(this.$route.params.row) + 1
    await this.getPrefectureRow()
    await this.getCities()
    await this.getMunicipalities()
  },
  methods: {
    async getPrefectureRow () {
      this.show = false
      await this.$axios.$get('Prefectures!' + this.prefecture_row + ':' + this.prefecture_row)
        .then((response) => {
          this.sheetRow = response.values[0]
          this.expenditure = this.$const.expenditure.prefecture
          this.year = this.sheetRow[1]
          this.prefectureCode = this.sheetRow[2]
          this.shaper()
        }).catch((error) => {
          console.error(error)
          this.$router.push('/')
        })
      this.show = true
    },
    async getCityRow () {
      this.show = false
      await this.$axios.$get('Cities!' + this.city_row + ':' + this.city_row)
        .then((response) => {
          this.sheetRow = response.values[0]
          this.expenditure = this.$const.expenditure.city
          this.shaper()
        }).catch((error) => {
          console.error(error)
          this.$router.push('/')
        })
      this.show = true
    },
    async getMunicipalityRow () {
      this.show = false
      await this.$axios.$get('Municipalities!' + this.municipality_row + ':' + this.municipality_row)
        .then((response) => {
          this.sheetRow = response.values[0]
          this.expenditure = this.$const.expenditure.municipality
          this.shaper()
        }).catch((error) => {
          console.error(error)
          this.$router.push('/')
        })
      this.show = true
    },
    shaper () {
      this.delay = this.expenditure.delay
      this.stracture = this.expenditure.stracture
      this.groupSum = {}
      this.items = Object.keys(this.stracture).map((item) => {
        return this.conv(item, this.stracture)
      })

      this.chartData.labels = []
      this.chartData.datasets[0].data = []
      Object.keys(this.groupSetting).forEach((element) => {
        this.chartData.labels.push(this.groupSetting[element])
        this.chartData.datasets[0].data.push((this.groupSum[element]) ?? 0)
      })
    },
    conv (num, parent) {
      const setting = parent[num]
      const cost = this.sheetRow[Number(num) + this.delay].replace(/,/g, '')
      if (setting?.group) {
        if (this.groupSum[setting.group] === undefined) { this.groupSum[setting.group] = 0 }
        if (!isNaN(cost)) { this.groupSum[setting.group] += Number(cost) }
      }
      const ret = {
        name: setting.name + ': ' + (isNaN(cost) ? 0 : cost),
        title: setting.name,
        cost: (isNaN(cost) ? 0 : cost),
        group: (setting?.group) ? setting?.group : null,
        index: num
      }
      if (setting.child) { ret.children = this.childConv(setting.child) }
      return ret
    },
    childConv (child) {
      return Object.keys(child).map((item) => {
        return this.conv(item, child)
      })
    },
    async getCities () {
      const cityData = await this.$axios.$get('Cities!A:D')
      this.cities = cityData.values.map((item, index) => {
        if (!isNaN(item[1]) && !isNaN(item[2])) {
          const rCode = item[2].slice(0, -4)
          if (Number(item[1]) === Number(this.year) && Number(rCode) === Number(this.prefectureCode)) {
            return {
              text: item[3],
              value: index + 1
            }
          }
        }
        return ''
      }).filter(v => v)
    },
    async getMunicipalities () {
      const municipalityData = await this.$axios.$get('Municipalities!A:D')
      this.municipalities = municipalityData.values.map((item, index) => {
        if (!isNaN(item[1]) && !isNaN(item[2])) {
          const rCode = item[2].slice(0, -4)
          if (Number(item[1]) === Number(this.year) && Number(rCode) === Number(this.prefectureCode)) {
            return {
              text: item[3],
              value: index + 1
            }
          }
        }
        return ''
      }).filter(v => v)
    },
    async setCity (row) {
      if (row === null) { return }
      this.city_row = row
      this.municipality_row = null
      await this.getCityRow()
    },
    async clearCity () {
      this.city_row = null
      await this.getPrefectureRow()
    },
    setMunicipality (row) {
      if (row === null) { return }
      this.municipality_row = row
      this.city_row = null
      this.getMunicipalityRow()
    },
    async clearMunicipality () {
      this.municipality_row = null
      await this.getPrefectureRow()
    }
  }
}
</script>
