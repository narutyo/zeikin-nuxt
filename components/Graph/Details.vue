<template>
  <v-row justify="center">
    <v-dialog
      v-model="dialog"
      max-width="450px"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{group_name}}
        </v-card-title>
        <v-card-text>
          <v-treeview
            :items="printItems"
          ></v-treeview>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  data () {
    return {
      dialog: false,
      group: '',
      items: [],
      printItems: []
    }
  },
  computed: {
    group_name () {
      const groupSetting = this.$const.groupSetting
      return (groupSetting[this.group]) ? groupSetting[this.group] : '明細'
    }
  },
  watch: {
    'dialog' (to, from) {
      if (to) {
        this.printItems = []
        this.conv(this.items)
      }
    }
  },
  created () {
    this.$nuxt.$on('graph-detail-dialog', (group, items) => {
      this.group = Number(group) + 1
      this.items = items
      this.dialog = true
    })
  },
  methods: {
    conv (arr) {
      arr.forEach((element) => {
        if (element.group === this.group) {
          this.printItems.push(element)
        } else if (element.children) {
          this.conv(element.children)
        }
      })
    }
  }
}
</script>
