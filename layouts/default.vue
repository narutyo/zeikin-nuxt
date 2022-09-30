<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          to="/"
          router
          exact
        >
          <v-list-item-icon>
            <v-icon>mdi-home</v-icon>
          </v-list-item-icon>

          <v-list-item-title>Home</v-list-item-title>
        </v-list-item>
        <v-list-group
          :value="true"
          prepend-icon="mdi-account-circle"
        >
          <template v-slot:activator>
            <v-list-item-title>都道府県別</v-list-item-title>
          </template>

          <v-list-group
            v-for="(prefData, index) in prefMenu"
            :key="index"
            no-action
            sub-group
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title>{{prefData.title}}</v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="(pref, i) in prefData.children"
              :key="i"
              :to="pref.to"
              router
              exact
            >
              <v-list-item-title v-text="pref.name"></v-list-item-title>
            </v-list-item>
          </v-list-group>

        </v-list-group>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      temporary
      fixed
    >
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>
              mdi-repeat
            </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
  data (context) {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      prefectureList: [],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: context.$config.title,

      prefMenu: []
    }
  },
  async mounted () {
    await this.getPrefecture()
  },
  methods: {
    async getPrefecture () {
      const prefData = await this.$axios.$get('Prefectures!A:D')

      const yearList = prefData.values.filter((item, index, self) => {
        const tmp = self.map(item => item[1])
        if (tmp.indexOf(item[1]) === index) {
          return item[1]
        }
        return ''
      })

      yearList.forEach((element) => {
        if (!isNaN(element[1])) {
          const children = prefData.values.map((item, index) => {
            if (item[1] === element[1]) {
              return {
                to: '/prefecture/' + index,
                name: item[3]
              }
            }
            return ''
          }).filter(v => v)

          this.prefMenu.push({
            title: element[1] + '年',
            children
          })
        }
      })
    }
  }
}
</script>
