<script>
import { PolarArea } from 'vue-chartjs'
import chartjsPluginColorschemes from 'chartjs-plugin-colorschemes'

export default {
  extends: PolarArea,
  props: {
    chartdata: {
      type: Object,
      default: () => {}
    },
    options: {
      type: Object,
      default: () => {}
    },
    items: {
      type: Array,
      default: () => []
    }
  },
  mounted () {
    this.renderChart(this.chartdata, { onClick: this.click, ...this.options })
  },
  methods: {
    click (point, event) {
      const element = event[0] || null
      if (element === null) {
        return
      }
      this.$nuxt.$emit('graph-detail-dialog', element._index, this.items)
    }
  }
}
</script>
