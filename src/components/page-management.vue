<template>
    <div id="app-management">
        <div id="left-menu">
            <div class="menu-item" @click="switchPage('console')" :class="{ active: menu == 'console' }">
                <dashboard-outlined />
            </div>
            <div class="menu-item" @click="switchPage('group')" :class="{ active: menu == 'group' }">
                <appstore-outlined />
            </div>
            <div class="menu-item" @click="switchPage('todo')" :class="{ active: menu == 'todo' }">
                <profile-outlined />
            </div>
            <div class="menu-item" @click="switchPage('all')" :class="{ active: menu == 'all' }">
                <read-outlined />
            </div>
            <div class="menu-item menu-foot" @click="switchPage('setting')" :class="{ active: menu == 'setting' }">
                <setting-outlined />
            </div>
        </div>
        <div class="content">
            <template v-if="menu == 'console'">
                <div class="flex align-center mb-5">
                    <div class="card full-width mr-5 pa-10">
                        <div class="flex align-center justify-between text-small">
                            <div>待办</div>
                            <div class="float-right flex align-center text-red">
                                <div class="mr-5">21%</div>
                                <caret-up-outlined />
                            </div>
                        </div>
                        <div class="flex align-end justify-between">
                            <div class="text-big">998</div>
                            <div class="text-small text-red">+13项</div>
                        </div>
                    </div>
                    <div class="card full-width mr-5 pa-10">
                        <div class="flex align-center justify-between text-small">
                            <div>进行</div>
                            <div class="float-right flex align-center text-gray">
                                <div class="mr-5">21%</div>
                                <minus-outlined />
                            </div>
                        </div>
                        <div class="flex align-end justify-between">
                            <div class="text-big">998</div>
                            <div class="text-small text-gray">0项</div>
                        </div>
                    </div>
                    <div class="card full-width pa-10">
                        <div class="flex align-center justify-between text-small">
                            <div>已办</div>
                            <div class="float-right flex align-center text-green">
                                <div class="mr-5">21%</div>
                                <caret-down-outlined />
                            </div>
                        </div>
                        <div class="flex align-end justify-between">
                            <div class="text-big">998</div>
                            <div class="text-small text-green">-13项</div>
                        </div>
                    </div>
                </div>
                <div class="flex align-center mb-5">
                    <div class="card full-width pa-10 mr-5" style="height: 220px;">
                        状态饼图
                    </div>
                    <div class="card full-width pa-10" style="height: 220px;">
                        标签饼图
                    </div>
                </div>
                <div class="card pa-10 mb-5" style="height: 150px;">
                    自选待办分组
                </div>
                <div class="full-width text-center">切换统计周期</div>
            </template>
            <template v-else-if="menu == 'group'">
                <a-empty :image="img" description="暂无可用分组" />
            </template>
            <template v-else-if="menu == 'todo'">
                <a-empty :image="img" description="暂无待办事项" />
            </template>
            <template v-else-if="menu == 'todo'">
                <a-empty :image="img" description="暂无可用事项" />
            </template>
            <template v-else-if="menu == 'todo'">
                <div>设置</div>
            </template>
        </div>
    </div>
</template>
  
<script>
import { DashboardOutlined, AppstoreOutlined, ProfileOutlined, ReadOutlined, SettingOutlined, AlertOutlined, CaretUpOutlined, MinusOutlined, CaretDownOutlined } from '@ant-design/icons-vue';
import { Empty } from 'ant-design-vue';

export default {
    name: "pageManagement",
    components: {
        DashboardOutlined, AppstoreOutlined, ProfileOutlined, ReadOutlined, SettingOutlined,
        AlertOutlined, CaretUpOutlined, MinusOutlined, CaretDownOutlined
    },
    data: () => ({
        menu: 'console',
        img: Empty.PRESENTED_IMAGE_SIMPLE,
    }),
    methods: {
        switchPage(name) {
            this.menu = name;
        }
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
    overflow-y: auto;
    padding: 10px;
    height: 493px;
    width: 100%;
}
</style>
  