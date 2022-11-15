<template>
  <app-head :mode="mode" :platform="platform" @close="close" />
  <page-management v-if="mode == 'management'" />
  <page-fast-add v-else-if="mode == 'fastAdd'" @close="close" />
</template>

<script>
import { CloseOutlined } from '@ant-design/icons-vue';
import pageManagement from './components/page-management.vue';
import pageFastAdd from './components/page-fast-add.vue';
import AppHead from './components/app-head.vue';
import api from './plugin/api';

export default {
  name: "App",
  components: { CloseOutlined, pageManagement, pageFastAdd, AppHead },
  data: () => ({
    mode: '',
    platform: ''
  }),
  methods: {
    close() {
      window.electron.closeWindow(this.mode);
    },
    getVersion(){
      api.getVersion().then(res=>{
        if(res.state == true) localStorage.setItem('version',res.result)
        localStorage.setItem('version',res.state == true ? res.result:'0.0.0')
      })
    }
  },
  created() {
    this.$message.config({
      maxCount: 1,
      top: `0px`
    });
    let search = window.location.search;
    if (search && search.length > 2 && search.indexOf('?') === 0) {
      let params = new URLSearchParams(search.substring(1))
      this.mode = params.get('mode')
      this.platform = params.get('platform')
    }
    this.getVersion();
  }
}
</script>

<style scoped>
#app-head {
  background-color: #2c2c2d;
  -webkit-touch-callout: none;
  -webkit-app-region: drag;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #999;
  display: flex;
  height: 27px;
  width: 100%;
}

#win-control {
  -webkit-app-region: no-drag;
  line-height: 16px;
  font-size: 16px;
  position: fixed;
  cursor: pointer;
  height: 27px;
  width: 46px;
  right: 0;
  top: 0;
}

#win-control:hover,
#win-control:active {
  background-color: red;
}
</style>
