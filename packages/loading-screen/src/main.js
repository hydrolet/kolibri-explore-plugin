import Vue from 'vue';
import VueRouter from 'vue-router';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import eosComponents from 'eos-components';
import App from '@/App.vue';

import ContentSourceSelection from '@/views/ContentSourceSelection.vue';
import UsbDriveConnection from '@/views/UsbDriveConnection.vue';
import PermissionsExplanation from '@/views/PermissionsExplanation.vue';
import Loading from '@/views/Loading.vue';
import Welcome from '@/views/Welcome.vue';

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueRouter);
Vue.use(eosComponents);

Vue.config.productionTip = false;

const routes = [
  { path: '/', redirect: '/loading/default' },
  { path: '/loading/:state', component: Loading },
  { path: '/welcome', component: Welcome },
  { path: '/select-source', component: ContentSourceSelection },
  { path: '/endless-key', component: UsbDriveConnection },
  {
    path: '/endless-key-required',
    component: UsbDriveConnection,
    props: { required: true },
  },
  { path: '/grant-permissions', component: PermissionsExplanation },
];

const router = new VueRouter({
  routes,
});

window.app = new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app');
