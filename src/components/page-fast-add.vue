<template>
  <div class="app-fast-add">
    <template v-if="matters != undefined">
      <a-carousel v-if="matters.length > 0" autoplay dotsClass="dot" dot-position="left">
        <div v-for="item in matters" :key="item.id">
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
              <a-button size="small" v-if="item.state === 1">正在进行</a-button>
              <a-button size="small" v-else-if="item.state === 2">已完成</a-button>
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
        <a-select placeholder="主要标签" allowClear showSearch v-model:value="form.tag[0]" size="small" :disabled="loaidng"
          style="width: 95px">
          <a-select-option v-for="item in config.tags" :value="item.id">
            {{ item.value }}
          </a-select-option>
        </a-select>
        <a-select placeholder="辅助标签" allowClear showSearch v-model:value="form.tag[1]" :disabled="!form.tag[0]"
          size="small" style="width: 95px">
          <a-select-option v-for="item in config.tags" :value="item.id" :disabled="loaidng || item.id == form.tag[0]">
            {{ item.value }}
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
    form: {
      content: '',
      state: 2,
      tag: []
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
      tags: [{
        id: 1,
        value: '测试标签'
      }, {
        id: 2,
        value: '标签1'
      }, {
        id: 3,
        value: '超级长的一个标签'
      }]
    }
  }),
  methods: {
    init() {
      api.initAdd().then(res => {
        if (res.state) {
          if (res.result.matters) {
            for (let i in res.result.matters) {
              let item = res.result.matters[i];
              item.date = util.distance(item.date);
            }
          }
          this.config.tags = res.result.tags;
          this.matters = res.result.matters;
          this.safe = res.result.safe;
          this.$forceUpdate();
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
    submit() {
      if (this.form.content.trim() === '') {
        this.$message.error({
          content: '事项内容不能为空'
        })
        return;
      }
      this.loaidng = true;
      api.addMatters(this.form).then(res => {
        if (res.state) {
          this.$message.success({
            content: '创建成功'
          })
          setTimeout(() => this.close(), 1500)
        } else {
          this.loaidng = false;
          this.$message.success({
            content: res.result ? res.result : '创建失败'
          })
        }
      }).catch(err => {
        this.loaidng = false;
        this.$message.success({
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
