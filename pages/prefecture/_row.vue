<template>
  <v-container>
    <div style="width: 600px">
      <bar
        v-if="show"
        :chartdata="chartData"
        :options="chartOptions"
        :items="items"
      ></bar>
      <polar
        v-if="show"
        :chartdata="chartData"
        :options="chartOptions"
        :items="items"
      ></polar>
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
  data () {
    return {
      show: false,

      items: [],
      sum: 0,
      sheetRow: [],
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
    const index = Number(this.$route.params.row) + 1
    await this.$axios.$get('Prefectures!' + index + ':' + index)
      .then((response) => {
        this.sheetRow = response.values[0]
        this.shaper()
      }).catch((error) => {
        console.error(error)
        this.$router.push('/')
      })
    this.show = true
  },
  methods: {
    shaper () {
      const expenditure = this.$const.expenditure.prefecture
      this.delay = expenditure.delay
      this.stracture = expenditure.stracture
      this.items = Object.keys(this.stracture).map((item) => {
        return this.conv(item, this.stracture)
      })

      const groupSetting = this.$const.groupSetting
      Object.keys(groupSetting).forEach((element) => {
        this.chartData.labels.push(groupSetting[element])
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
    }
  }
}
</script>
