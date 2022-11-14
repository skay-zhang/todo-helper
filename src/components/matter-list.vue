<template>
  <div class="float-right pa-10">
    <a-button class="mr-5" size="small" @click="cleanScreen">清除</a-button>
    <a-button type="primary" size="small" @click="openScreen">筛选</a-button>
  </div>
  <a-empty style="margin-top:180px;" v-if="number == 0" :image="img" :description="'暂无' + name[type] + '事项'" />
  <div v-else>
    <div class="flex align-center pa-10">
      <a-button class="mr-5" size="small" shape="circle" @click="getMattersNumber()">
        <template #icon>
          <reload-outlined />
        </template>
      </a-button>
      <div>共 {{ number }} 条{{ name[type] }}事项</div>
    </div>
    <div class="list" :class="{ 'show-toolbar': select > 0 }">
      <div class="card pa-10 mb-10" v-for="(item, index) in list" :key="'todo_' + item.id" @click="openEdit(item)">
        <div>{{ item.content }}</div>
        <div class="flex align-center justify-between">
          <div class="flex align-center">
            <a-checkbox class="mr-5 select" :class="{ checked: item.select }" v-if="mode !== 'remove'" @click.stop=""
              @change="selectItem(index)">
            </a-checkbox>
            <div class="text-small text-gray">{{ item.distance }}</div>
          </div>
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
    <div class="toolbar flex align-center justify-between" :class="{ show: select > 0 }" v-if="mode !== 'remove'">
      <div class="flex align-center">
        <a-button class="mr-10" size="small" type="primary" v-if="mode !== 'complete'" @click.stop="changeState(3)">
          已完成
        </a-button>
        <a-button class="mr-10" size="small" v-if="mode === 'todo'" @click.stop="changeState(2)">进行中
        </a-button>
      </div>
      <a-button size="small" type="text" danger @click.stop="remove(true)">
        <delete-filled /> 删除
      </a-button>
    </div>
  </div>
  <matter-edit ref="edit" @update="getMattersNumber()" />
  <a-modal v-model:visible="screen.show" :width="234" :closable="false" :footer="null" style="top: 25px;right: -75px;">
    <div>
      <div class="flex align-center mb-10">
        <div class="text-small mr-10">开始日期</div>
        <a-date-picker placeholder="请选择..." v-model:value="screen[mode].start" />
      </div>
      <div class="flex align-center mb-10">
        <div class="text-small mr-10">结束日期</div>
        <a-date-picker placeholder="请选择..." v-model:value="screen[mode].end" />
      </div>
      <div class="flex align-center mb-10">
        <div class="text-small mr-10" style="width: 48px;">标签</div>
        <a-select v-model:value="search" allowClear showSearch placeholder="请输入选择标签" :not-found-content="null"
          :filter-option="false" :show-arrow="false" @search="searchTag" @change="changeTag" style="width: 135px">
          <a-select-option v-for="(item, index) in tag" :key="item.id" :value="index">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div class="flex align-center mb-10">
        <div class="text-small mr-10" style="width: 75px;">内容</div>
        <a-input v-model:value="screen[mode].content" placeholder="请输入关键词" />
      </div>
      <div>
        <a-button size="small" @click="cleanScreen">清除</a-button>
        <a-button type="primary" class="float-right" size="small" @click="submitScreen">筛选</a-button>
      </div>
    </div>
  </a-modal>
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
    mode: '',
    list: [],
    number: 0,
    img: Empty.PRESENTED_IMAGE_SIMPLE,
    search: null,
    select: 0,
    screen: {
      show: false,
      todo: {
        start: '',
        end: '',
        tag: null,
        content: '',
        del: 0,
        state: 1,
        number: 10,
        page: 1
      },
      progress: {
        start: '',
        end: '',
        tag: null,
        content: '',
        del: 0,
        state: 2,
        number: 10,
        page: 1
      },
      complete: {
        start: '',
        end: '',
        tag: null,
        content: '',
        del: 0,
        state: 3,
        number: 10,
        page: 1
      },
      remove: {
        start: '',
        end: '',
        tag: null,
        content: '',
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
    },
    tag: []
  }),
  methods: {
    getMattersNumber(mode) {
      this.$emit('loading', { state: true });
      if (mode == undefined) mode = this.type;
      if (this.mode != mode) this.search = null;
      this.mode = mode;
      this.number = 0;
      this.select = 0;
      let screen = this.buildScreen(mode);
      api.getMattersNumber(screen).then(res => {
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
      this.mode = mode;
      let screen = this.buildScreen(mode);
      api.getMattersList(screen).then(res => {
        this.$emit('loading', { state: false });
        if (res.state) {
          for (let i in res.result) {
            let item = res.result[i];
            if (item.t4) item.date = util.formatTime(parseInt(item.t4), 'yyyy-MM-dd hh:mm')
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
    openScreen() {
      this.screen.show = true;
    },
    submitScreen() {
      this.screen.show = false;
      this.getMattersNumber();
    },
    cleanScreen() {
      let cache = {
        todo: {
          start: '',
          end: '',
          tag: null,
          content: '',
          del: 0,
          state: 1,
          number: 10,
          page: 1
        },
        progress: {
          start: '',
          end: '',
          tag: null,
          content: '',
          del: 0,
          state: 2,
          number: 10,
          page: 1
        },
        complete: {
          start: '',
          end: '',
          tag: null,
          content: '',
          del: 0,
          state: 3,
          number: 10,
          page: 1
        },
        remove: {
          start: '',
          end: '',
          tag: null,
          content: '',
          del: 1,
          state: 0,
          number: 10,
          page: 1
        }
      }
      this.screen[this.mode] = JSON.parse(JSON.stringify(cache[this.mode]));
      this.getMattersNumber();
      this.screen.show = false;
    },
    searchTag(e) {
      if (e === '') return false;
      api.searchTags(e).then(res => {
        this.tag = res.state ? res.result : []
      }).catch(err => {
        this.tag = []
        this.$message.error({
          content: '查询失败,' + err
        })
      })
    },
    changeTag(e) {
      if (this.tag[e]) this.screen[this.mode].tag = this.tag[e].id
    },
    selectItem(index) {
      let now = this.list[index].select;
      if (now == undefined || now == null) now = false;
      this.select = now ? this.select - 1 : this.select + 1;
      this.list[index].select = !now;
    },
    changeState(info, next) {
      if (next === undefined) {
        let ids = [];
        for (let i in this.list) {
          if (this.list[i].select) ids.push(this.list[i].id);
        }
        let title = '';
        if (info === 2) title = '这些事项确认“正在进行”吗?'
        else if (info === 3) title = '这些事项确认“已完成”吗?'
        this.$confirm({
          class: 'change-tips',
          content: `已选事项数量: ${ids.length}`,
          cancelText: '取消',
          okText: '确认',
          title,
          onOk: () => {
            this.$emit('loading', { state: true });
            let check = 0;
            for (let i in ids) {
              api.updateMatterState(ids[i], info).then(() => {
                check++
              }).catch(() => {
                check++
              })
            }
            let time = setInterval(() => {
              if (check == ids.length) {
                this.$message.success({
                  content: '状态修改完成'
                })
                this.getMattersNumber()
                clearInterval(time);
              }
            }, 500);
          }
        })
      } else {
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
      }
    },
    remove(info, del) {
      if (del === undefined) {
        let ids = [];
        for (let i in this.list) {
          if (this.list[i].select) ids.push(this.list[i].id);
        }
        let tag = info ? '删除' : '还原';
        this.$confirm({
          class: 'change-tips',
          content: `已选事项数量: ${ids.length}`,
          cancelText: '取消',
          okText: '确认',
          title: `确认要${tag}这些事项吗?`,
          onOk: () => {
            this.$emit('loading', { state: true });
            let check = 0;
            for (let i in ids) {
              api.removeMatter(ids[i], info ? 1 : 0).then(() => {
                check++
              }).catch(() => {
                check++
              })
            }
            let time = setInterval(() => {
              if (check == ids.length) {
                this.$message.success({
                  content: tag + '完成'
                })
                this.getMattersNumber()
                clearInterval(time);
              }
            }, 500);
          }
        })
      } else {
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
      }
    },
    openEdit(item) {
      this.$refs.edit.open(item)
    },
    buildScreen(mode) {
      let screen = JSON.parse(JSON.stringify(this.screen[mode]));
      if (screen.start) screen.start = this.screen[mode].start.startOf('day').unix();
      if (screen.end) screen.end = this.screen[mode].end.endOf('day').unix();
      return screen;
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

.select {
  margin-top: -2px;
  display: none;
}

.card:hover .select {
  display: flex;
}

.select.checked {
  display: flex !important;
}

.show-toolbar {
  padding-bottom: 45px;
}

.toolbar {
  box-shadow: 0 -5px 10px 0 rgba(0, 0, 0, 0.5);
  transition: all ease-out 0.3s;
  background-color: #202020;
  border-radius: 8px 0 0 0;
  position: fixed;
  padding: 10px;
  bottom: -40px;
  width: 346px;
  opacity: 0;
  right: 0;
}

.toolbar.show {
  opacity: 1;
  bottom: 0;
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

  .toolbar {
    box-shadow: 0 -5px 10px 0 rgba(0, 0, 0, 0.1);
    background-color: #fff;
  }
}
</style>
    