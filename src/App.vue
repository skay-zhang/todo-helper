<template>
  <div id="app-head">
    <div v-if="mode == 'management'">事项管理</div>
    <div v-else-if="mode == 'fastAdd'">快速创建事项</div>
    <div v-else>待办助手</div>
  </div>
  <div class="hello">
    <div>{{ mode }} mode</div>
    <button @click="close">关闭</button>
  </div>
</template>

<script>
export default {
  name: "App",
  data: () => ({
    mode: ''
  }),
  methods: {
    close() {
      window.electron.closeWindow(this.mode);
    }
  },
  created() {
    let search = window.location.search;
    if (search && search.length > 2 && search.indexOf('?') === 0) {
      let params = new URLSearchParams(search.substring(1))
      this.mode = params.get('mode')
    }
  }
}
</script>

<style scoped>
.hello {
  justify-content: center;
  align-items: center;
  display: flex;
  height: 275px;
}

#app-head {
  background-color: #2c2c2d;
  -webkit-touch-callout: none;
  -webkit-app-region: drag;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  color: #999;
  display: flex;
  height: 25px;
  width: 100%;
}
</style>
