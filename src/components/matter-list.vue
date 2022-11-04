<template>
  <a-empty v-if="number == 0" :image="img" description="暂无待办事项" />
  <div v-else>
    <div class="flex align-center justify-between mb-10">
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
    <div class="card pa-10 mb-10" v-for="item in list" :key="'todo_' + item.id">
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
    
<script>
import { ReloadOutlined } from '@ant-design/icons-vue';
import { Empty } from 'ant-design-vue';
import util from '../plugin/util';
import api from '../plugin/api';
export default {
  name: "MatterList",
  components: { ReloadOutlined },
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
      progress: '条进行',
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
      api.getMattersList(this.screen[mode]).then(res => {
        this.$emit('loading', { state: false });
        if (res.state) {
          for (let i in res.result) {
            let item = res.result[i];
            res.result[i].datetime = util.formatTime(parseInt(item.date), 'yyyy-MM-dd hh:mm')
            res.result[i].distance = util.distance(item.date)
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
</style>
    