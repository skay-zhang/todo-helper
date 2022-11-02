<template>
  <div id="app-management">
    <div id="left-menu">
      <div class="menu-item" @click="switchPage('todo')" :class="{ active: menu == 'todo' }">
        <calendar-outlined />
      </div>
      <div class="menu-item" @click="switchPage('progress')" :class="{ active: menu == 'progress' }">
        <clock-circle-outlined />
      </div>
      <div class="menu-item" @click="switchPage('complete')" :class="{ active: menu == 'complete' }">
        <carry-out-outlined />
      </div>
      <div class="menu-item" @click="switchPage('remove')" :class="{ active: menu == 'remove' }">
        <delete-outlined />
      </div>
      <div class="menu-item menu-foot" @click="switchPage('setting')" :class="{ active: menu == 'setting' }">
        <setting-outlined />
      </div>
    </div>
    <div class="content">
      <template v-if="menu == 'todo'">
        <a-empty v-if="cache.todo.number == 0" :image="img" description="暂无待办事项" />
        <div v-else>
          <div class="flex align-center justify-between mb-10">
            <div>共 {{ cache.todo.number }} 条待办事项</div>
            <div>
              <a-button class="mr-5" size="small">清除</a-button>
              <a-button type="primary" size="small">筛选</a-button>
            </div>
          </div>
          <div class="card pa-10 mb-10" v-for="item in cache.todo.list" :key="'todo_' + item.id">
            <div>{{ item.content }}</div>
            <div class="flex align-center justify-between">
              <div class="text-small text-gray">{{ item.distance }}</div>
              <div class="flex align-center" v-if="item.tag && item.tag.length > 0">
                <div class="todo-tag" v-for="tag in item.tag" :key="'todo_' + item.id + '_' + tag.id">
                  {{ tag.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="menu == 'progress'">
        <a-empty v-if="cache.progress.number == 0" :image="img" description="暂无进行中的事项" />
        <div v-else>
          <div class="flex align-center justify-between mb-10">
            <div>共 {{ cache.progress.number }} 条进行中的事项</div>
            <div>
              <a-button class="mr-5" size="small">清除</a-button>
              <a-button type="primary" size="small">筛选</a-button>
            </div>
          </div>
          <div class="card pa-10 mb-10" v-for="item in cache.progress.list" :key="'progress_' + item.id">
            <div>{{ item.content }}</div>
            <div class="flex align-center justify-between">
              <div class="text-small text-gray">{{ item.distance }}</div>
              <div class="flex align-center" v-if="item.tag && item.tag.length > 0">
                <div class="todo-tag" v-for="tag in item.tag" :key="'progress_' + item.id + '_' + tag.id">
                  {{ tag.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="menu == 'complete'">
        <a-empty v-if="cache.complete.number == 0" :image="img" description="暂无已完成的事项" />
        <div v-else>
          <div class="flex align-center justify-between mb-10">
            <div>共 {{ cache.complete.number }} 条已完成的事项</div>
            <div>
              <a-button class="mr-5" size="small">清除</a-button>
              <a-button type="primary" size="small">筛选</a-button>
            </div>
          </div>
          <div class="card pa-10 mb-10" v-for="item in cache.complete.list" :key="'complete_' + item.id">
            <div>{{ item.content }}</div>
            <div class="flex align-center justify-between">
              <div class="text-small text-gray">{{ item.distance }}</div>
              <div class="flex align-center" v-if="item.tag && item.tag.length > 0">
                <div class="todo-tag" v-for="tag in item.tag" :key="'complete_' + item.id + '_' + tag.id">
                  {{ tag.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="menu == 'remove'">
        <a-empty v-if="cache.remove.number == 0" :image="img" description="暂无已删除的事项" />
        <div v-else>
          <div class="flex align-center justify-between mb-10">
            <div>共 {{ cache.remove.number }} 条已删除的事项</div>
            <div>
              <a-button class="mr-5" size="small">清除</a-button>
              <a-button type="primary" size="small">筛选</a-button>
            </div>
          </div>
          <div class="card pa-10 mb-10" v-for="item in cache.remove.list" :key="'remove_' + item.id">
            <div>{{ item.content }}</div>
            <div class="flex align-center justify-between">
              <div class="text-small text-gray">{{ item.distance }}</div>
              <div class="flex align-center" v-if="item.tag && item.tag.length > 0">
                <div class="todo-tag" v-for="tag in item.tag" :key="'remove_' + item.id + '_' + tag.id">
                  {{ tag.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="menu == 'setting'">
        <div>设置</div>
      </template>
      <div class="flex align-center justify-center loading" v-if="loading">
        <a-spin />
      </div>
    </div>
  </div>
</template>
  
<script>
import {
  CalendarOutlined, SettingOutlined, AlertOutlined, CaretUpOutlined, MinusOutlined,
  CaretDownOutlined, ClockCircleOutlined, CarryOutOutlined, DeleteOutlined
} from '@ant-design/icons-vue';
import { Empty } from 'ant-design-vue';
import util from '../plugin/util'
import api from '../plugin/api'

export default {
  name: "pageManagement",
  components: {
    CalendarOutlined, SettingOutlined, AlertOutlined, CaretUpOutlined, MinusOutlined,
    CaretDownOutlined, ClockCircleOutlined, CarryOutOutlined, DeleteOutlined
  },
  data: () => ({
    menu: '',
    loading: true,
    img: Empty.PRESENTED_IMAGE_SIMPLE,
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
    cache: {
      tags: {},
      todo: {
        number: 0,
        list: []
      },
      progress: {
        number: 0,
        list: []
      },
      complete: {
        number: 0,
        list: []
      },
      remove: {
        number: 0,
        list: []
      }
    }
  }),
  methods: {
    switchPage(name) {
      if (this.menu == name) return false;
      this.menu = name;
      if (name !== 'setting') this.getMattersNumber(name);
    },
    getTagList() {
      api.getTagList().then(res => {
        if (res.state) {
          let tags = {};
          for (let i in res.result) {
            let item = res.result[i];
            tags[item.id] = {
              name: item.name,
              default: item.default
            }
          }
          this.cache.tags = tags;
          this.switchPage('todo');
        } else {
          this.loading = false;
          this.$message.error({
            content: res.result ? res.result : '获取标签列表失败'
          })
        }
      }).catch(err => {
        this.loading = false;
        this.$message.error({
          content: '获取标签列表失败,' + err
        })
      })
    },
    getMattersNumber(mode) {
      this.cache[mode].number = 0;
      api.getMattersNumber(this.screen[mode]).then(res => {
        if (res.state) {
          this.cache[mode].number = res.result;
          this.getMattersList(mode)
        } else {
          this.loading = false;
          this.$message.error({
            content: res.result ? res.result : '获取待办数量失败'
          })
        }
      }).catch(err => {
        this.loading = false;
        this.$message.error({
          content: '获取待办数量失败,' + err
        })
      })
    },
    getMattersList(mode) {
      this.cache[mode].list = [];
      api.getMattersList(this.screen[mode]).then(res => {
        this.loading = false;
        if (res.state) {
          for (let i in res.result) {
            let item = res.result[i];
            res.result[i].datetime = util.formatTime(parseInt(item.date), 'yyyy-MM-dd hh:mm')
            res.result[i].distance = util.distance(item.date)
            if (item.tag && item.tag.indexOf('[') == 0) {
              let tags = JSON.parse(item.tag);
              let list = [];
              for (let x in tags) {
                let cache = this.cache.tags[tags[x]];
                if (cache) list.push({
                  id: tags[x],
                  name: cache.name
                })
              }
              res.result[i].tag = list;
            }
          }
          this.cache[mode].list = res.result;
        } else {
          this.$message.error({
            content: res.result ? res.result : '获取待办列表失败'
          })
        }
      }).catch(err => {
        this.loading = false;
        this.$message.error({
          content: '获取待办列表失败,' + err
        })
      })
    }
  },
  created() {
    this.getTagList();
  }
}
</script>
  
<style scoped>
#app-management {
  display: flex;
}

#left-menu {
  background-color: #212122;
  position: relative;
  height: 493px;
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
  position: relative;
  overflow-y: auto;
  padding: 10px;
  height: 493px;
  width: 100%;
}

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

.loading {
  background-color: rgba(0, 0, 0, .3);
  position: absolute;
  height: 493px;
  width: 100%;
  left: 0;
  top: 0;
}
</style>
  