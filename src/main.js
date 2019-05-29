import Vue from 'vue'
import VueKonva from 'vue-konva'
import vueHeadful from 'vue-headful'
import Swatches from 'vue-swatches'
import "vue-swatches/dist/vue-swatches.min.css"
import App from './App.vue'

Vue.use(VueKonva)
Vue.component('vue-headful', vueHeadful)
Vue.component('Swatches', Swatches)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
