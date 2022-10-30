<template>
  <div id="app-head">
    <div v-if="mode == 'management'">事项管理</div>
    <div v-else-if="mode == 'fastAdd'">快速创建事项</div>
    <div v-else>待办助手</div>
  </div>
  <div v-if="platform == 'win32'" id="win-control" class="flex align-center justify-center" @click="close">
    <close-outlined />
  </div>
</template>
  
<script>
import { CloseOutlined } from '@ant-design/icons-vue';
export default {
  name: "AppHead",
  components: { CloseOutlined },
  props: {
    mode: {
      type: String,
      default: ''
    },
    platform: {
      type: String,
      default: ''
    }
  },
  methods: {
    close() {
      this.$emit('close', {});
    }
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
  