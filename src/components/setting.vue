<template>
  <div class="setting pa-10">
    <div class="card flex align-center mb-10">
      <img alt="Logo" class="logo" :src="'./logo/logo.png'" />
      <div class="full-width">
        <div class="title">待办助手</div>
        <div class="text-small text-gray mb-5">cc.stacks.todo.helper</div>
        <div class="flex align-center">
          <div class="text-small mr-10">v{{ version }}</div>
          <a-button type="text" size="small" @click="getVersion()">检查更新</a-button>
        </div>
      </div>
      <div class="github" @click="openGithub">
        <github-outlined />
      </div>
    </div>
    <div class="card pa-10 mb-10">
      <div class="text-gray">数据统计</div>
      <div class="flex align-center justify-center" style="height: 160px;" v-if="loading">
        <a-spin />
      </div>
      <template v-else>
        <div class="flex align-center justify-between pt-10">
          <div class="label">待办事项</div>
          <div>{{ statistics.state['1'] }} 项</div>
        </div>
        <div class="flex align-center justify-between pt-10">
          <div class="label">进行中事项</div>
          <div>{{ statistics.state['2'] }} 项</div>
        </div>
        <div class="flex align-center justify-between pt-10">
          <div class="label">已完成事项</div>
          <div>{{ statistics.state['3'] }} 项</div>
        </div>
        <div class="flex align-center justify-between pt-10">
          <div class="label">回收站</div>
          <div>{{ statistics.del }} 项</div>
        </div>
        <div class="flex align-center justify-between pt-10">
          <div class="label">标签</div>
          <div>{{ statistics.tags }} 个</div>
        </div>
      </template>
    </div>
    <div class="card pa-10 mb-10">
      <a-button class="mr-10" @click="importData">导入</a-button>
      <a-button class="mr-10" @click="exportData">导出</a-button>
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
    loading: true,
    version: '',
    remind: {
      todo: false,
      progress: true,
      complete: false
    },
    statistics: {
      del: 0,
      state: {
        '1': 0,
        '2': 0,
        '3': 0
      },
      tags: 0
    }
  }),
  methods: {
    getVersion() {
      api.getNewVersion().then(res => {
        if (res) {
          let git = parseInt(res.replaceAll('.', ''));
          let now = parseInt(this.version.replaceAll('.', ''));
          if (git > now) api.updateNewVersion();
          else this.$message.success({content: '当前已是最新版本'})
        }
      })
    },
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
    },
    exportData() {
      this.$confirm({
        class: 'change-tips',
        content: `警告: 此操作可能需要一段时间, 在导出过程中请勿操作, 否则将发生无法预料的错误, 确认要继续导出吗?`,
        cancelText: '取消',
        okText: '确认',
        title: `导出全部数据?`,
        onOk: () => {
          api.exportData().then(res => {
            if (res.state) {
              this.$message.success({
                content: '导出任务已创建'
              })
            } else {
              this.$message.error({
                content: res.result ? res.result : '导出失败'
              })
            }
          }).catch(err => {
            this.$message.error({
              content: '导出失败,' + err
            })
          })
        }
      })
    },
    importData() {
      this.$confirm({
        class: 'change-tips',
        content: `警告: 此操作可能需要一段时间, 在导入过程中请勿操作, 否则将发生无法预料的错误, 确认要继续导入吗?`,
        cancelText: '取消',
        okText: '确认',
        title: `导入外部数据?`,
        onOk: () => {
          api.importData().then(res => {
            if (res.state) {
              this.$message.success({
                content: '导入任务已创建'
              })
            } else {
              this.$message.error({
                content: res.result ? res.result : '导入失败'
              })
            }
          }).catch(err => {
            this.$message.error({
              content: '导入失败,' + err
            })
          })
        }
      })
    },
    getStatistics() {
      this.loading = true;
      api.getStatistics().then(res => {
        setTimeout(() => {
          this.loading = false;
        }, 500)
        if (res.state) {
          this.statistics = {
            del: res.result.del,
            state: {
              '1': 0,
              '2': 0,
              '3': 0
            },
            tags: res.result.tags
          }
          for (let i in res.result.state) {
            this.statistics.state[res.result.state[i].state] = res.result.state[i].number
          }
        } else {
          this.$message.error({
            content: res.result ? res.result : '刷新失败'
          })
        }
      }).catch(err => {
        this.loading = false;
        this.$message.error({
          content: '刷新失败,' + err
        })
      })
    }
  },
  mounted() {
    this.version = localStorage.getItem('version');
    this.getStatistics();
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
</style>
    