<template>
  <div class="app-fast-add">
    <template v-if="matters != null && matters != undefined">
      <a-carousel v-if="matters.length > 0" autoplay dotsClass="dot" dot-position="left">
        <div v-for="(item) in matters" :key="item.id">
          <div class="pa-10 flex align-center justify-between">
            <div class="flex align-center">
              <div class="ml-5">"</div>
              <div class="line1 tips">{{ item.content }}</div>
              <div>"</div>
              <div v-if="item.state === 1">开始进行了吗?</div>
              <div v-else-if="item.state === 2">完成了吗?</div>
              <div v-else-if="item.state === 3">已完成</div>
            </div>
            <div class="flex align-center">
              <a-button size="small" @click="changeState(item)" v-if="item.state === 1">正在进行</a-button>
              <a-button size="small" @click="changeState(item)" v-else-if="item.state === 2">已完成</a-button>
              <a-button type="text" size="small" v-else-if="item.state === 3">{{ item.date }}</a-button>
            </div>
          </div>
        </div>
      </a-carousel>
      <div v-else class="pa-10 flex align-center justify-between">
        <div class="flex align-center">
          哇哦, 这是你的第一条事项~
        </div>
        <div class="flex align-center">
          <a-button type="text" size="small">👏</a-button>
        </div>
      </div>
    </template>
    <div class="flex align-center pa-10" v-else>
      <loading-outlined style="font-size: 24px;" />
      <div class="ml-10">正在初始化...</div>
    </div>
    <a-textarea ref="content" v-model:value="form.content" :disabled="loaidng"
      placeholder="请输入事项内容, 限1000字以内, 按下 Ctrl+Enter 即可提交..." :auto-size="{ minRows: 5, maxRows: 5 }"
      @keydown.enter.native="keydown" />
    <div class="pa-10 flex align-center justify-between">
      <div class="flex align-center">
        <div class="text-small mr-10">状态</div>
        <a-select v-model:value="form.state" size="small" :disabled="loaidng" style="width: 80px">
          <a-select-option v-for="item in config.state" :value="item.id">
            {{ item.value }}
          </a-select-option>
        </a-select>
        <div class="text-small mr-10 ml-10">标签</div>
        <a-select placeholder="主要标签" size="small" allowClear showSearch v-model:value="config.tag[0]"
          :not-found-content="null" :filter-option="false" :show-arrow="false" :disabled="loaidng" style="width: 95px"
          class="mr-5" @search="key => search(0, key)" @change="i => changeTag(0, i)" @keydown.enter.native="keydown">
          <a-select-option v-for="item in config.tags[0]" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
        <a-select placeholder="辅助标签" size="small" allowClear showSearch v-model:value="config.tag[1]"
          :not-found-content="null" :filter-option="false" :show-arrow="false" :disabled="config.tag[0] == undefined"
          style="width: 95px" @search="key => search(1, key)" @change="i => changeTag(1, i)"
          @keydown.enter.native="keydown">
          <a-select-option v-for="item in config.tags[1]" :value="item.id"
            :disabled="loaidng || item.name == form.tags[0]">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>
      <div>
        <a-button class="mr-5" size="small" :disabled="loaidng" @click="close">取消</a-button>
        <a-button type="primary" size="small" :loading="loaidng" @click="submit">完成</a-button>
      </div>
    </div>
  </div>
</template>

<script>
import { LoadingOutlined } from '@ant-design/icons-vue';
import util from '../plugin/util'
import api from '../plugin/api'
export default {
  name: "pageFastAdd",
  components: { LoadingOutlined },
  data: () => ({
    loaidng: false,
    matters: null,
    form: {
      content: '',
      state: 2,
      tags: []
    },
    config: {
      state: [{
        id: 1,
        value: '待办'
      }, {
        id: 2,
        value: '正在做'
      }, {
        id: 3,
        value: '已办'
      }],
      tags: [],
      tag: []
    }
  }),
  methods: {
    init() {
      this.matters = null;
      api.initAdd().then(res => {
        if (res.state) {
          if (res.result.matters) {
            for (let i in res.result.matters) {
              let item = res.result.matters[i];
              item.date = util.distance(item.date);
            }
          }
          this.matters = res.result.matters;
          this.safe = res.result.safe;
        }
      }).catch(err => {
        this.loaidng = false;
        this.$message.success({
          content: '初始化失败,' + err
        })
      });
      this.$refs.content.focus()
    },
    keydown(e) {
      if (e.ctrlKey && e.keyCode == 13) this.submit()
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
      this.config.tag[level] = tag.id;
      this.form.tags[level] = tag;
    },
    changeState(info) {
      let title = '';
      if (info.state === 1) title = '此事项确认“正在进行”吗?'
      else if (info.state === 2) title = '此事项确认“已完成”吗?'

      this.$confirm({
        class: 'change-tips',
        content: `事项内容: ${info.content}`,
        cancelText: '取消',
        okText: '确认',
        title,
        onOk: () => {
          api.updateMatterState(info.id, info.state + 1).then(res => {
            if (res.state) {
              this.$message.success({
                content: '修改成功'
              })
              this.init()
            } else {
              this.$message.error({
                content: res.result ? res.result : '修改失败'
              })
            }
          }).catch(err => {
            this.$message.error({
              content: '修改失败,' + err
            })
          })
        }
      })
    },
    addTag() {
      for (let i in this.form.tags) {
        let tag = this.form.tags[i];
        if (tag == null || tag == undefined) continue;
        if (tag.id == 0) {
          console.log('[ui] Add tag ' + tag.name)
          api.addTag(tag.name).then(res => {
            if (res.state) {
              this.form.tags[i].id = res.result;
              if (i == this.form.tags.length - 1) this.submit();
              else this.addTag();
            } else {
              this.loaidng = false;
              this.$message.error({
                content: res.result ? res.result : '标签创建失败'
              })
            }
          }).catch(err => {
            this.loaidng = false;
            this.$message.error({
              content: '标签创建失败,' + err
            })
          })
          return false;
        }
      }
      return true;
    },
    submit() {
      if (this.form.content.trim() === '') {
        this.$message.error({
          content: '事项内容不能为空'
        })
        return;
      }
      this.loading = true;
      if (!this.addTag()) return;
      let tag = [];
      for (let i in this.form.tags) {
        let item = this.form.tags[i];
        if (item == null || item == undefined) continue;
        if (item.id != 0) tag.push(item.id)
      }

      api.addMatter({
        content: this.form.content,
        state: this.form.state,
        tag
      }).then(res => {
        if (res.state) {
          this.$message.success({
            content: '创建成功'
          })
          setTimeout(() => this.close(), 1500)
        } else {
          this.loaidng = false;
          this.$message.error({
            content: res.result ? res.result : '创建失败'
          })
        }
      }).catch(err => {
        this.loaidng = false;
        this.$message.error({
          content: '创建失败,' + err
        })
      })
    },
    close() {
      this.$emit('close', {});
    }
  },
  created() {
    setTimeout(() => this.init(), 300);
  }
}

</script>
<style scoped>
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

.ant-carousel :deep(.slick-slide) {
  overflow: hidden;
  color: #f4f4f4;
  height: 40px;
}

.ant-carousel :deep(.slick-track) {
  height: 40px !important;
}


.ant-carousel :deep(.slick-dots) {
  left: 2px;
}

.ant-carousel :deep(.slick-dots) li,
.ant-carousel :deep(.slick-dots) button,
.ant-carousel :deep(.slick-active)>li,
.ant-carousel :deep(.slick-active)>button {
  height: 8px !important;
  width: 8px !important;
  border-radius: 8px;
}

.ant-carousel :deep(.slick-dots) li {
  margin: 2px 0;
}

.tips {
  max-width: 260px;
}
</style>
