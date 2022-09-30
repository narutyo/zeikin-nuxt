<template>
  <v-treeview
    activatable
    :items="items"
  ></v-treeview>
</template>

<script>
export default {
  name: 'PrefectureNum',
  data () {
    return {
      items: [],
      sheetRow: [],
      delay: 0,
      stracture: {}
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
  },
  methods: {
    shaper () {
      const expenditure = this.$const.expenditure[this.sheetRow[1]]
      this.delay = expenditure.delay
      this.stracture = expenditure.stracture
      this.items = Object.keys(this.stracture).map((item) => {
        return this.conv(item, this.stracture)
      })
    },
    conv (num, parent) {
      const setting = parent[num]
      const cost = this.sheetRow[Number(num) + this.delay].replace(/,/g, '')
      const ret = {
        name: setting.name + ': ' + (isNaN(cost) ? 0 : cost)
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
