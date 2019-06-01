import Vue from 'vue'
import BootstrapVue from 'bootstrap-vue'
import VueKonva from 'vue-konva'
import vueHeadful from 'vue-headful'
import Swatches from 'vue-swatches'
import VueFullscreen from 'vue-fullscreen'

import "vue-swatches/dist/vue-swatches.min.css"
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'

Vue.use(VueFullscreen)
Vue.use(BootstrapVue)
Vue.use(VueKonva)
Vue.component('vue-headful', vueHeadful)
Vue.component('Swatches', Swatches)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
