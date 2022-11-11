<template>
  <a-empty v-if="number == 0" :image="img" :description="'暂无' + name[type] + '事项'" />
  <div v-else>
    <div class="flex align-center justify-between pa-10">
      <div class="flex align-center">
        <a-button class="mr-5" size="small" shape="circle" @click="getMattersNumber()">
          <template #icon>
            <reload-outlined />
          </template>
        </a-button>
        <div>共 {{ number }} 条{{ name[type] }}事项</div>
      </div>
      <div>
        <a-button class="mr-5" size="small">清除</a-button>
        <a-button type="primary" size="small">筛选</a-button>
      </div>
    </div>
    <div class="list">
      <div class="card pa-10 mb-10" v-for="item in list" :key="'todo_' + item.id" @click="openEdit(item)">
        <div>{{ item.content }}</div>
        <div class="flex align-center justify-between">
          <div class="text-small text-gray">{{ item.distance }}</div>
          <div class="flex align-center" v-if="item.tag && item.tag.length > 0">
            <div class="todo-tag" v-for="tag in item.tag" :key="'todo_' + item.id + '_' + tag.id">
              {{ tag.name }}
            </div>
          </div>
        </div>
        <div class="tools flex align-center justify-between">
          <div class="flex align-center">
            <a-button class="mr-10" size="small" type="primary" v-if="item.state <= 2"
              @click.stop="changeState(item, 3)">已完成
            </a-button>
            <a-button class="mr-10" size="small" v-if="item.state <= 1" @click.stop="changeState(item, 2)">进行中
            </a-button>
            <div v-if="item.state == 3">{{ item.date }} 已完成</div>
          </div>
          <a-button size="small" type="text" danger @click.stop="remove(item, false)" v-if="item.del">
            <rollback-outlined /> 还原
          </a-button>
          <a-button size="small" type="text" danger @click.stop="remove(item, true)" v-else>
            <delete-filled /> 删除
          </a-button>
        </div>
      </div>
    </div>
  </div>
  <matter-edit ref="edit" @update="getMattersNumber()" />
</template>
    
<script>
import { ReloadOutlined, DeleteFilled, RollbackOutlined } from '@ant-design/icons-vue';
import { Empty } from 'ant-design-vue';
import MatterEdit from './matter-edit.vue';
import util from '../plugin/util';
import api from '../plugin/api';

export default {
  name: "MatterList",
  components: { ReloadOutlined, DeleteFilled, RollbackOutlined, MatterEdit },
  emits: ['loading'],
  props: {
    type: {
      type: String,
      default: 'todo'
    },
    tags: {
      type: Object,
      default: {}
    }
  },
  data: () => ({
    img: Empty.PRESENTED_IMAGE_SIMPLE,
    number: 0,
    list: [],
    screen: {
      todo: {
        start: '',
        end: '',
        tag: '',
        del: 0,
        state: 1,
        number: 10,
        page: 1
      },
      progress: {
        start: '',
        end: '',
        tag: '',
        del: 0,
        state: 2,
        number: 10,
        page: 1
      },
      complete: {
        start: '',
        end: '',
        tag: '',
        del: 0,
        state: 3,
        number: 10,
        page: 1
      },
      remove: {
        start: '',
        end: '',
        tag: '',
        del: 1,
        state: 0,
        number: 10,
        page: 1
      }
    },
    name: {
      todo: '待办',
      progress: '进行中',
      complete: '已完成',
      remove: '已删除',
    }
  }),
  methods: {
    getMattersNumber(mode) {
      this.$emit('loading', { state: true });
      if (mode == undefined) mode = this.type;
      this.number = 0;
      api.getMattersNumber(this.screen[mode]).then(res => {
        if (res.state) {
          this.number = res.result;
          this.list = [];
          setTimeout(() => this.getMattersList(mode), 300)
        } else {
          this.$emit('loading', { state: false });
          this.$message.error({
            content: res.result ? res.result : '获取待办数量失败'
          })
        }
      }).catch(err => {
        this.$emit('loading', { state: false });
        this.$message.error({
          content: '获取待办数量失败,' + err
        })
      })
    },
    getMattersList(mode) {
      if (mode == undefined) mode = this.type;
      api.getMattersList(this.screen[mode]).then(res => {
        this.$emit('loading', { state: false });
        if (res.state) {
          for (let i in res.result) {
            let item = res.result[i];
            if (item.t3) item.date = util.formatTime(parseInt(item.t3), 'yyyy-MM-dd hh:mm')
            item.datetime = util.formatTime(parseInt(item.t1), 'yyyy-MM-dd hh:mm')
            item.distance = util.distance(item.t1)
            if (item.tag && item.tag.indexOf('[') == 0) {
              let tags = JSON.parse(item.tag);
              let list = [];
              for (let x in tags) {
                let cache = this.tags[tags[x]];
                if (cache) list.push({
                  id: tags[x],
                  name: cache.name
                })
              }
              res.result[i].tag = list;
            }
          }
          this.list = res.result;
        } else {
          this.$message.error({
            content: res.result ? res.result : '获取待办列表失败'
          })
        }
      }).catch(err => {
        this.$emit('loading', { state: false });
        this.$message.error({
          content: '获取待办列表失败,' + err
        })
      })
    },
    changeState(info, next) {
      let title = '';
      if (next === 2) title = '此事项确认“正在进行”吗?'
      else if (next === 3) title = '此事项确认“已完成”吗?'

      this.$confirm({
        class: 'change-tips',
        content: `事项内容: ${info.content}`,
        cancelText: '取消',
        okText: '确认',
        title,
        onOk: () => {
          api.updateMatterState(info.id, next).then(res => {
            if (res.state) {
              this.$message.success({
                content: '状态修改成功'
              })
              this.getMattersNumber()
            } else {
              this.$message.error({
                content: res.result ? res.result : '状态修改失败'
              })
            }
          }).catch(err => {
            this.$message.error({
              content: '状态修改失败,' + err
            })
          })
        }
      })
    },
    remove(info, del) {
      let tag = del ? '删除' : '还原';
      this.$confirm({
        class: 'change-tips',
        content: `事项内容: ${info.content}`,
        cancelText: '取消',
        okText: '确认',
        title: `确认要${tag}此事项吗?`,
        onOk: () => {
          api.removeMatter(info.id, del ? 1 : 0).then(res => {
            if (res.state) {
              this.$message.success({
                content: tag + '成功'
              })
              this.getMattersNumber()
            } else {
              this.$message.error({
                content: res.result ? res.result : tag + '失败'
              })
            }
          }).catch(err => {
            this.$message.error({
              content: tag + '失败,' + err
            })
          })
        }
      })
    },
    openEdit(item) {
      this.$refs.edit.open(item)
    }
  }
}
</script>
    
<style scoped>
.todo-tag {
  transition: all ease-out 0.3s;
  background-color: #555555;
  border-radius: 3px;
  margin-left: 5px;
  font-size: 12px;
  cursor: pointer;
  padding: 0 4px;
  color: #999;
}

.todo-tag:hover {
  background-color: #3d3d3d;
  color: #f4f4f4;
}

.list {
  height: calc(520px - 71px);
  overflow-y: overlay;
  padding: 0 10px;
}

.card {
  transition: all ease-out 0.3s;
  position: relative;
  cursor: pointer;
}

.card:hover {
  background-color: #2a2a2a;
  padding-bottom: 40px;
}

.tools {
  border-top: 1px solid #4a4a4a;
  transition: all ease-out 0.3s;
  background-color: #202020;
  padding: 5px 5px 0 5px;
  position: absolute;
  width: 100%;
  bottom: 5px;
  opacity: 0;
  left: 0;
}

.card:hover .tools {
  background-color: #2a2a2a;
  opacity: 1;
}

textarea {
  background-color: #2d2d2d;
  color: #f4f4f4;
  border: none;
}

textarea[disabled] {
  background-color: #000;
  color: #f4f4f4;
  border: none;
}

textarea:focus {
  box-shadow: none;
  border: none;
}

@media (prefers-color-scheme: light) {
  .todo-tag {
    background-color: #ededed;
    color: #7f7f7f;
  }

  .todo-tag:hover {
    background-color: #dbdbdb;
    color: #333;
  }

  .card:hover {
    background-color: #fafafa;
  }

  .tools {
    border-top: 1px solid #eeeeee;
    background-color: #fff;
  }

  .card:hover .tools {
    background-color: #fff;
  }

  textarea {
    background-color: #fff;
    color: #333;
  }

  textarea[disabled] {
    background-color: #fff;
    color: #333;
  }
}
</style>
    