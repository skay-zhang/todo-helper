<template>
  <div class="setting pa-10">
    <div class="card flex align-center mb-10">
      <img class="logo" :src="'./logo/logo.png'" />
      <div class="full-width">
        <div class="title">待办助手</div>
        <div class="text-small text-gray mb-5">cc.stacks.todo.helper</div>
        <div class="flex align-center">
          <div class="text-small mr-10">v1.0.0</div>
          <a-button type="text" size="small">检查更新</a-button>
        </div>
      </div>
      <div class="github" @click="openGithub">
        <github-outlined />
      </div>
    </div>
    <div class="card pa-10 mb-10">
      <div class="text-gray">默认项</div>
      <div class="flex align-center justify-between pt-10">
        <div class="label">默认状态</div>
        <div>进行中</div>
      </div>
      <div class="flex align-center justify-between pt-10">
        <div class="label">默认一级标签</div>
        <div>占位文本</div>
      </div>
      <div class="flex align-center justify-between pt-10">
        <div class="label">默认二级标签</div>
        <div>占位文本</div>
      </div>
    </div>
    <div class="card pa-10 mb-10">
      <div class="text-gray">通知提醒</div>
      <div class="flex align-center justify-between pt-10">
        <div class="label">待办事项</div>
        <a-switch v-model:checked="remind.todo" />
      </div>
      <div class="flex align-center justify-between pt-10">
        <div class="label">进行中事项</div>
        <a-switch v-model:checked="remind.progress" />
      </div>
      <div class="flex align-center justify-between pt-10">
        <div class="label">已完成事项</div>
        <a-switch v-model:checked="remind.complete" />
      </div>
    </div>
    <div class="card pa-10 mb-10">
      <a-button class="mr-10">导入</a-button>
      <a-button class="mr-10">导出</a-button>
      <a-button class="mr-10" type="primary" danger @click="clean">清空回收站</a-button>
    </div>
  </div>
</template>
    
<script>
import { GithubOutlined } from '@ant-design/icons-vue';
import api from '../plugin/api';
export default {
  name: "Setting",
  components: { GithubOutlined },
  data: () => ({
    remind: {
      todo: false,
      progress: true,
      complete: false
    }
  }),
  methods: {
    openGithub() {
      window.open('https://github.com/skay-zhang/todo-helper', 'github', 'width=1024,height=800,resizable=0')
    },
    clean() {
      this.$confirm({
        class: 'change-tips',
        content: `警告: 此操作将彻底删除回收站中的事项,无法恢复! 确认要清空吗?`,
        cancelText: '取消',
        okText: '确认',
        title: `清空回收站?`,
        onOk: () => {
          api.cleanMatter().then(res => {
            if (res.state) {
              this.$message.success({
                content: '回收站已清空'
              })
            } else {
              this.$message.error({
                content: res.result ? res.result : '清空失败'
              })
            }
          }).catch(err => {
            this.$message.error({
              content: '清空失败,' + err
            })
          })
        }
      })
    }
  }
}
</script>
    
<style scoped>
.logo {
  margin-right: 5px;
  height: 80px;
  width: 80px;
}

.title {
  line-height: 18px;
  font-size: 18px;
}

.github {
  padding-right: 10px;
  font-size: 24px;
  cursor: pointer;
}

.api-item {
  padding-bottom: 5px;
}

.api-method {
  background-color: #11b832;
  text-align: center;
  border-radius: 4px;
  padding: 1px 3px;
  font-size: 12px;
  width: 42px;
}


.api-method.post {
  background-color: #b85711;
}

.api-name {
  width: 120px;
}

@media (prefers-color-scheme: light) {}
</style>
    