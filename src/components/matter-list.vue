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
            <div v-if="item.state == 3">2022-01-01 11:20 已完成</div>
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
  <a-drawer :width="360" placement="right" :closable="false" :destroyOnClose="true" :visible="edit.show"
    @close="closeEdit">
    <div class="text-big mb-10">编辑事项</div>
    <a-textarea ref="content" v-model:value="edit.form.content" class="mb-10"
      placeholder="请输入事项内容, 限1000字以内, 按下 Ctrl+Enter 即可提交..." :auto-size="{ minRows: 5, maxRows: 5 }"
      v-on:keydown.enter="keydown" />
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">状态</div>
      <a-select v-model:value="edit.form.state" size="small" :disabled="loading" style="width: 80px">
        <a-select-option v-for="item in config.state" :key="item.id" :value="item.id">
          {{ item.value }}
        </a-select-option>
      </a-select>
    </div>
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">标签</div>
      <a-select placeholder="主要标签" size="small" allowClear showSearch v-model:value="config.tag[0]"
        :not-found-content="null" :filter-option="false" :show-arrow="false" :disabled="loading" style="width: 95px"
        class="mr-5" @search="key => search(0, key)" @change="i => changeTag(0, i)" v-on:keydown.enter="keydown">
        <a-select-option v-for="item in config.tags[0]" :key="item.id" :value="item.id">
          {{ item.name }}
        </a-select-option>
      </a-select>
      <a-select placeholder="辅助标签" size="small" allowClear showSearch v-model:value="config.tag[1]"
        :not-found-content="null" :filter-option="false" :show-arrow="false" :disabled="config.tag[0] == undefined"
        style="width: 95px" @search="key => search(1, key)" @change="i => changeTag(1, i)" v-on:keydown.enter="keydown">
        <a-select-option v-for="item in config.tags[1]" :key="item.id" :value="item.id"
          :disabled="loading || item.name == edit.form.tag[0]">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>
    <a-divider orientation="left">时间点</a-divider>
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">创建时间</div>
      <a-date-picker v-model:value="edit.form.t1" :locale="locale" size="small" show-time placeholder="何时创建了事项" />
    </div>
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">待办时间</div>
      <a-date-picker v-model:value="edit.form.t2" :locale="locale" size="small" show-time placeholder="状态变为待办的时间" />
    </div>
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">进行时间</div>
      <a-date-picker v-model:value="edit.form.t3" :locale="locale" :disabled="edit.form.state < 2" size="small"
        show-time placeholder="状态变为进行中的时间" />
    </div>
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">完成时间</div>
      <a-date-picker v-model:value="edit.form.t4" :locale="locale" :disabled="edit.form.state != 3" size="small"
        show-time placeholder="状态变为已完成的时间" />
    </div>
    <div class="flex align-center mb-10" v-if="edit.form.t5">
      <div class="text-small mr-10">上次更新</div>
      <div>{{ edit.form.t5 }}</div>
    </div>
    <template #footer>
      <div class="float-right">
        <a-button class="mr-5" size="small" :disabled="loading" @click="closeEdit">取消<span
            class="text-small ml-5">(ESC)</span></a-button>
        <a-button type="primary" size="small" :loading="loading" @click="update">保存变更<span
            class="text-small ml-5">(Ctrl+Enter)</span></a-button>
      </div>
    </template>
  </a-drawer>
</template>
    
<script>
import { ReloadOutlined, DeleteFilled, RollbackOutlined } from '@ant-design/icons-vue';
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import { Empty } from 'ant-design-vue';
import util from '../plugin/util';
import api from '../plugin/api';
import { ref } from 'vue';
import dayjs from 'dayjs';

export default {
  name: "MatterList",
  components: { ReloadOutlined, DeleteFilled, RollbackOutlined },
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
    locale: locale,
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
    },
    edit: {
      show: false,
      form: {
        id: 0,
        content: '',
        state: 0,
        tag: [],
        t1: '',
        t2: '',
        t3: '',
        t4: '',
        t5: ''
      }
    },
    config: {
      state: [{
        id: 1,
        value: '待办'
      }, {
        id: 2,
        value: '进行中'
      }, {
        id: 3,
        value: '已完成'
      }],
      tags: [],
      tag: []
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
            res.result[i].datetime = util.formatTime(parseInt(item.t1), 'yyyy-MM-dd hh:mm')
            res.result[i].distance = util.distance(item.t1)
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
      let form = JSON.parse(JSON.stringify(item));
      if (form.t1) form.t1 = ref(dayjs((parseInt(form.t1))))
      if (form.t2) form.t2 = ref(dayjs((parseInt(form.t2))))
      if (form.t3) form.t3 = ref(dayjs((parseInt(form.t3))))
      if (form.t4) form.t4 = ref(dayjs((parseInt(form.t4))))
      if (form.t5) form.t5 = util.formatTime(parseInt(form.t5), 'yyyy-MM-dd hh:mm')
      console.log(form)
      this.edit = {
        show: true,
        form
      }
    },
    closeEdit() {
      this.edit = {
        show: false,
        form: {
          id: 0,
          content: '',
          state: 0,
          tag: [],
          t1: '',
          t2: '',
          t3: '',
          t4: '',
          t5: ''
        }
      }
      this.config.tags = [];
      this.config.tag = [];
    },
    search(level, value) {
      api.searchTags(value).then(res => {
        if (res.state) {
          let exist = false;
          for (let i in res.result) {
            if (res.result[i].name == value) {
              exist = true;
              break;
            }
          }
          if (!exist) {
            res.result.push({
              id: 0,
              name: value,
              default: false
            })
          }
          this.config.tags[level] = res.result
        } else this.config.tags[level] = []
      }).catch(err => {
        this.config.tags[level] = []
        this.$message.error({
          content: '查询失败,' + err
        })
      })
    },
    changeTag(level, index) {
      let tag = this.config.tags[level][index];
      if (tag.id) {
        this.config.tag[level] = tag.id;
        this.edit.form.tag[level] = tag;
      }
    },
    addTag() {
      for (let i in this.edit.form.tag) {
        let tag = this.edit.form.tag[i];
        if (tag == null || tag == undefined) continue;
        if (tag.id == 0) {
          console.log('[ui] Add tag ' + tag.name)
          api.addTag(tag.name).then(res => {
            if (res.state) {
              this.edit.form.tag[i].id = res.result;
              if (i == this.edit.form.tag.length - 1) this.submit();
              else this.addTag();
            } else {
              this.loading = false;
              this.$message.error({
                content: res.result ? res.result : '标签创建失败'
              })
            }
          }).catch(err => {
            this.loading = false;
            this.$message.error({
              content: '标签创建失败,' + err
            })
          })
          return false;
        }
      }
      return true;
    },
    keydown(e) {
      if (e.ctrlKey && e.keyCode == 13) this.update()
    },
    update() {

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
    