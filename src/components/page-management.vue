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
      <matter-list ref="matterList" v-if="menu != 'setting'" :type="menu" :tags="tags" @loading="listLoading" />
      <template v-else>
        <div>设置</div>
      </template>
      <div class="flex align-center justify-center loading" :class="{show:loading.opacity}" v-if="loading.show">
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
import MatterList from './matter-list.vue'
import api from '../plugin/api'

export default {
  name: "pageManagement",
  components: {
    CalendarOutlined, SettingOutlined, AlertOutlined, CaretUpOutlined, MinusOutlined,
    CaretDownOutlined, ClockCircleOutlined, CarryOutOutlined, DeleteOutlined,
    MatterList
  },
  data: () => ({
    menu: '',
    tags: {},
    loading: {
      opacity: true,
      show: true,
      time: 0
    }
  }),
  methods: {
    switchPage(name) {
      if (this.menu == name) return false;
      this.menu = name;
      if (name !== 'setting') this.$refs.matterList.getMattersNumber(name);
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
          this.tags = tags;
          this.switchPage('todo');
        } else {
          this.switchLoading(false)
          this.$message.error({
            content: res.result ? res.result : '获取标签列表失败'
          })
        }
      }).catch(err => {
        console.log(err)
        this.switchLoading(false)
        this.$message.error({
          content: '获取标签列表失败,' + err
        })
      })
    },
    switchLoading(state) {
      clearTimeout(this.loading.time);
      if (state) {
        this.loading.show = true;
        this.loading.opacity = true;
      } else {
        this.loading.opacity = false;
        this.loading.time = setTimeout(() => {
          this.loading.show = false;
        }, 300)
      }
    },
    listLoading(data){
      this.switchLoading(data.state)
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

.loading {
  background-color: #131313;
  transition: all ease-out 0.3s;
  position: absolute;
  height: 493px;
  width: 100%;
  opacity: 0;
  left: 0;
  top: 0;
}

.loading.show {
  opacity: 1;
}
</style>
  