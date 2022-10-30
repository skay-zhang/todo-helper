<template>
    <div id="app-management">
        <div id="left-menu">
            <div class="menu-item" :class="{ active: menu == 'console' }">
                <dashboard-outlined />
            </div>
            <div class="menu-item" :class="{ active: menu == 'group' }">
                <appstore-outlined />
            </div>
            <div class="menu-item" :class="{ active: menu == 'todo' }">
                <profile-outlined />
            </div>
            <div class="menu-item" :class="{ active: menu == 'all' }">
                <read-outlined />
            </div>
            <div class="menu-item menu-foot" :class="{ active: menu == 'setting' }">
                <setting-outlined />
            </div>
        </div>
        <div class="content">
            Hello World!
        </div>
    </div>
</template>
  
<script>
import { DashboardOutlined, AppstoreOutlined, ProfileOutlined, ReadOutlined, SettingOutlined, AlertOutlined } from '@ant-design/icons-vue';

export default {
    name: "pageManagement",
    components: { DashboardOutlined, AppstoreOutlined, ProfileOutlined, ReadOutlined, SettingOutlined, AlertOutlined },
    data: () => ({
        menu: 'console'
    })
}
</script>
  
<style scoped>
#app-management {
    display: flex;
}

#left-menu {
    background-color: #212122;
    position: relative;
    height: 573px;
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
    height: 573px;
    width: 100%;
}
</style>
  