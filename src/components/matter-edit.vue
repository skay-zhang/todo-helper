<template>
  <a-drawer :width="360" placement="right" :closable="false" :destroyOnClose="true" :visible="show" @close="closeEdit">
    <div class="text-big mb-10">#{{ form.id }} 编辑事项</div>
    <a-textarea ref="content" v-model:value="form.content" class="mb-10" :disabled="loading"
      placeholder="请输入事项内容, 限1000字以内, 按下 Ctrl+Enter 即可提交..." :auto-size="{ minRows: 5, maxRows: 5 }"
      v-on:keydown.enter="keydown" />
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">状态</div>
      <a-select v-model:value="form.state" size="small" :disabled="loading" style="width: 80px">
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
        <a-select-option v-for="(item, index) in config.tags[0]" :key="item.id" :value="index">
          {{ item.name }}
        </a-select-option>
      </a-select>
      <a-select placeholder="辅助标签" size="small" allowClear showSearch v-model:value="config.tag[1]"
        :not-found-content="null" :filter-option="false" :show-arrow="false"
        :disabled="loading || config.tag[0] == undefined" style="width: 95px" @search="key => search(1, key)"
        @change="i => changeTag(1, i)" v-on:keydown.enter="keydown">
        <a-select-option v-for="(item, index) in config.tags[1]" :key="item.id" :value="index"
          :disabled="item.name == form.tag[0]">
          {{ item.name }}
        </a-select-option>
      </a-select>
    </div>
    <a-divider orientation="left">时间点</a-divider>
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">创建时间</div>
      <a-date-picker v-model:value="form.t1" :locale="locale" :disabled="loading" size="small" show-time
        placeholder="何时创建了事项" />
    </div>
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">待办时间</div>
      <a-date-picker v-model:value="form.t2" :locale="locale" :disabled="loading" size="small" show-time
        placeholder="状态变为待办的时间" />
    </div>
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">进行时间</div>
      <a-date-picker v-model:value="form.t3" :locale="locale" :disabled="loading || form.state < 2" size="small"
        show-time placeholder="状态变为进行中的时间" />
    </div>
    <div class="flex align-center mb-10">
      <div class="text-small mr-10">完成时间</div>
      <a-date-picker v-model:value="form.t4" :locale="locale" :disabled="loading || form.state != 3" size="small"
        show-time placeholder="状态变为已完成的时间" />
    </div>
    <div class="flex align-center mb-10" v-if="form.t5">
      <div class="text-small mr-10">上次更新</div>
      <div>{{ form.t5 }}</div>
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
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import util from '../plugin/util';
import api from '../plugin/api';
import { ref } from 'vue';
import dayjs from 'dayjs';

export default {
  name: "MatterEdit",
  emits: ['update'],
  data: () => ({
    show: false,
    locale: locale,
    loading: false,
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
    open(item) {
      if (item.del) return false;
      let form = JSON.parse(JSON.stringify(item));
      if (form.t1) form.t1 = ref(dayjs((parseInt(form.t1))))
      if (form.t2) form.t2 = ref(dayjs((parseInt(form.t2))))
      if (form.t3) form.t3 = ref(dayjs((parseInt(form.t3))))
      if (form.t4) form.t4 = ref(dayjs((parseInt(form.t4))))
      if (form.t5) form.t5 = util.formatTime(parseInt(form.t5), 'yyyy-MM-dd hh:mm')
      if (form.tag && form.tag.length > 0) {
        this.config.tag[0] = form.tag[0].name;
        this.config.tags[0] = [form.tag[0]];
        if (form.tag.length === 2) {
          this.config.tag[1] = form.tag[1].name;
          this.config.tags[1] = [form.tag[1]];
        }
      }
      this.form = form;
      this.show = true;
    },
    closeEdit() {
      if (this.loading) return false;
      this.show = false;
      this.loading = false;
      this.form = {
        id: 0,
        content: '',
        state: 0,
        tag: [],
        t1: '',
        t2: '',
        t3: '',
        t4: '',
        t5: ''
      };
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
      if (index == undefined) {
        delete this.config.tag[level];
        delete this.form.tag[level];
      } else {
        let tag = this.config.tags[level][index];
        if (tag == undefined) return false;
        if (tag.id) {
          this.config.tag[level] = tag.name;
          this.form.tag[level] = tag;
        } else this.form.tag[level] = tag;
      }
    },
    addTag() {
      for (let i in this.form.tag) {
        let tag = this.form.tag[i];
        if (tag == null || tag == undefined) continue;
        if (tag.id == 0) {
          api.addTag(tag.name).then(res => {
            if (res.state) {
              this.form.tag[i].id = res.result;
              if (i == this.form.tag.length - 1) this.update();
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
      if (this.form.content.trim() === '') {
        this.$message.error({
          content: '事项内容不能为空'
        })
        return;
      }
      this.loading = true;
      if (!this.addTag()) return;
      let tag = [];
      for (let i in this.form.tag) {
        let item = this.form.tag[i];
        if (item == null || item == undefined) continue;
        if (item.id != 0) tag.push(item.id)
      }

      let form = {
        id: this.form.id,
        content: this.form.content,
        state: this.form.state,
        t1: this.form.t1,
        t2: this.form.t2,
        t3: this.form.t3,
        t4: this.form.t4,
        tag,
      }
      if (form.t1) form.t1 = form.t1.unix() * 1000;
      if (form.t2) form.t2 = form.t2.unix() * 1000;
      if (form.t3) form.t3 = form.t3.unix() * 1000;
      if (form.t4) form.t4 = form.t4.unix() * 1000;
      api.editMatter(form).then(res => {
        this.loading = false;
        if (res.state) {
          this.$message.success({
            content: '保存成功'
          })
          this.closeEdit();
          this.$emit('update', { state: true });
        } else {
          this.$message.error({
            content: res.result ? res.result : '保存失败'
          })
        }
      }).catch(err => {
        this.loading = false;
        this.$message.error({
          content: '保存失败,' + err
        })
      })
    }
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

@media (prefers-color-scheme: light) {
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
      