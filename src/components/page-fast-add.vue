<template>
  <div class="app-fast-add">
    <div>
      <div class="line1 pa-10 flex align-center justify-between">
        <div class="flex align-center">
          <alert-outlined class="mr-5" />
          <div>"编写xx模块"完成了吗</div>
        </div>
        <div class="flex align-center">
          <a-button type="text" size="small">还在进行</a-button>
          <a-button size="small">已完成</a-button>
        </div>
      </div>
    </div>
    <a-textarea v-model:value="form.text" placeholder="请输入事项内容, 限1000字以内, 按下 Ctrl+Enter 即可提交..."
      :auto-size="{ minRows: 5, maxRows: 5 }" />
    <div class="pa-10 flex align-center justify-between">
      <div class="flex align-center">
        <div class="text-small mr-10">状态</div>
        <a-select ref="select" v-model:value="form.state" size="small" style="width: 80px">
          <a-select-option v-for="item in config.state" :value="item.id">
            {{ item.value }}
          </a-select-option>
        </a-select>
        <div class="text-small mr-10 ml-10">标签</div>
        <a-select placeholder="主要标签" allowClear showSearch ref="select" v-model:value="form.tags[0]" size="small" style="width: 95px">
          <a-select-option v-for="item in config.tags" :value="item.id">
            {{ item.value }}
          </a-select-option>
        </a-select>
        <a-select placeholder="辅助标签" allowClear showSearch ref="select" v-model:value="form.tags[1]" :disabled="!form.tags[0]" size="small" style="width: 95px">
          <a-select-option v-for="item in config.tags" :value="item.id" :disabled="item.id == form.tags[0]">
            {{ item.value }}
          </a-select-option>
        </a-select>
      </div>
      <div>
        <a-button class="mr-5" size="small" @click="close">取消</a-button>
        <a-button type="primary" size="small">完成</a-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "pageFastAdd",
  data: () => ({
    form: {
      text: '',
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
    close() {
      this.$emit('close', {});
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

textarea:focus {
  box-shadow: none;
  border: none;
}
</style>
