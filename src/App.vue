<template>
  <div id="app-head">
    <div v-if="mode == 'management'">事项管理</div>
    <div v-else-if="mode == 'fastAdd'">快速创建事项</div>
    <div v-else>待办助手</div>
  </div>
  <div v-if="mode == 'management'" id="app-management">
    <div id="left-menu">
      <div class="menu-item">
        <dashboard-outlined />
      </div>
      <div class="menu-item">
        <appstore-outlined />
      </div>
      <div class="menu-item">
        <profile-outlined />
      </div>
      <div class="menu-item">
        <read-outlined />
      </div>
      <div class="menu-item menu-foot">
        <setting-outlined />
      </div>
    </div>
    <div class="content">
      Hello World!
    </div>
  </div>
  <div v-else-if="mode == 'fastAdd'" class="app-fast-add">
    <div>
      <div class="line1 pa-10 flex align-center justify-between">
        <div class="flex align-center">
          <alert-outlined class="mr-5" />
          <div>"编写xx模块"完成了吗</div>
        </div>
        <div class="flex align-center">
          <a-button type="text" size="small">还在进行</a-button>
          <a-button size="small">已完成</a-button>
        </div>
      </div>
    </div>
    <a-textarea v-model:value="form.text" placeholder="请输入事项内容, 限1000字以内, 按下 Ctrl+Enter 即可提交..." :auto-size="{ minRows: 5, maxRows: 5 }" />
    <div class="pa-10 flex align-center justify-between">
      <div class="flex align-center">
        <div class="text-small mr-10">状态</div>
        <a-select ref="select" v-model:value="form.state" size="small" style="width: 80px">
          <a-select-option :value="1">待办</a-select-option>
          <a-select-option :value="2">正在做</a-select-option>
          <a-select-option :value="3">已办</a-select-option>
        </a-select>
        <div class="text-small mr-10 ml-10">标签</div>
        <a-select v-model:value="form.tags" size="small" style="width: 170px" :options="config.tags"></a-select>
      </div>
      <div>
        <a-button class="mr-5" size="small" @click="close">取消</a-button>
        <a-button type="primary" size="small">完成</a-button>
      </div>
    </div>
  </div>
  <!-- <div class="hello">
    <div>{{ mode }} mode</div>
    <a-button type="primary" @click="close">关闭</a-button>
  </div> -->
</template>

<script>
import { DashboardOutlined, AppstoreOutlined, ProfileOutlined, ReadOutlined, SettingOutlined, AlertOutlined } from '@ant-design/icons-vue';

export default {
  name: "App",
  components: { DashboardOutlined, AppstoreOutlined, ProfileOutlined, ReadOutlined, SettingOutlined, AlertOutlined },
  data: () => ({
    mode: '',
    form: {
      text: '',
      state: 2,
      tags: []
    },
    config: {
      tags: []
    }
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

#app-management {
  display: flex;
}

#left-menu {
  background-color: #212122;
  position: relative;
  height: 575px;
  width: 50px;
}

#left-menu .menu-item {
  transition: all ease-out 0.3s;
  color: #818181;
  line-height: 24px;
  cursor: pointer;
  font-size: 24px;
  padding: 13px;
}

#left-menu .menu-foot {
  position: absolute;
  bottom: 0;
  left: 0;
}

#left-menu .menu-item.active,
#left-menu .menu-item:hover {
  color: #ffffff;
}

.content {
  overflow-x: hidden;
  overflow-y: auto;
  height: 575px;
  width: 100%;
}

textarea {
  background-color: #2d2d2d;
  color: #f4f4f4;
  border: none;
}

textarea:focus {
  box-shadow: none;
  border: none;
}
</style>
