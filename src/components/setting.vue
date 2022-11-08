<template>
    <div class="setting pa-10">
        <div class="card flex align-center mb-10">
            <img class="logo" src="/logo/logo.png" />
            <div class="full-width">
                <div class="title">待办助手</div>
                <div class="text-small text-gray mb-5">cc.stacks.todo_helper</div>
                <div class="flex align-center">
                    <div class="text-small mr-10">v1.0.0</div>
                    <a-button type="text" size="small">检查更新</a-button>
                </div>
            </div>
            <div class="github">
                <github-outlined />
            </div>
        </div>
        <div class="card pa-10 mb-10">
            <div class="text-gray">默认项</div>
            <div class="flex align-center justify-between pt-10">
                <div class="label">默认状态</div>
                <div>进行中</div>
            </div>
            <div class="flex align-center justify-between pt-10">
                <div class="label">默认一级标签</div>
                <div>占位文本</div>
            </div>
            <div class="flex align-center justify-between pt-10">
                <div class="label">默认二级标签</div>
                <div>占位文本</div>
            </div>
        </div>
        <div class="card pa-10 mb-10">
            <div class="text-gray">通知提醒</div>
            <div class="flex align-center justify-between pt-10">
                <div class="label">待办事项</div>
                <a-switch v-model:checked="remind.todo" />
            </div>
            <div class="flex align-center justify-between pt-10">
                <div class="label">进行中事项</div>
                <a-switch v-model:checked="remind.progress" />
            </div>
            <div class="flex align-center justify-between pt-10">
                <div class="label">已完成事项</div>
                <a-switch v-model:checked="remind.complete" />
            </div>
        </div>
        <div class="card pa-10 mb-10">
            <a-button class="mr-10">导入</a-button>
            <a-button class="mr-10">导出</a-button>
            <a-button class="mr-10" type="primary" danger>清空回收站</a-button>
            <a-button>API</a-button>
        </div>
        <div class="card pa-10 mb-10">
            <div class="flex align-center">
                <div class="mr-10">端口: 22333</div>
                <div class="ml-10">密钥: D1FM89F0X312R13F21</div>
            </div>
        </div>
        <div class="card pa-10">
            <div class="api-item flex align-center">
                <div class="api-method post mr-10">POST</div>
                <div class="api-name">获取事项数量</div>
                <div>/api/matter/number</div>
            </div>
            <div class="api-item flex align-center">
                <div class="api-method post mr-10">POST</div>
                <div class="api-name">获取事项列表</div>
                <div>/api/matter/list</div>
            </div>
            <div class="api-item flex align-center">
                <div class="api-method post mr-10">POST</div>
                <div class="api-name">更新事项状态</div>
                <div>/api/matter/{id}</div>
            </div>
            <div class="api-item flex align-center">
                <div class="api-method mr-10">GET</div>
                <div class="api-name">获取事项详情</div>
                <div>/api/matter/{id}</div>
            </div>
        </div>
    </div>
</template>
    
<script>
import { GithubOutlined } from '@ant-design/icons-vue';
export default {
    name: "Setting",
    components: { GithubOutlined },
    data: () => ({
        remind: {
            todo: false,
            progress: true,
            complete: false
        }
    }),
    methods: {
    }
}
</script>
    
<style scoped>
.logo {
    margin-right: 5px;
    height: 80px;
    width: 80px;
}

.title {
    line-height: 18px;
    font-size: 18px;
}

.github {
    padding-right: 10px;
    font-size: 24px;
    cursor: pointer;
}

.api-item{
    padding-bottom: 5px;
}

.api-method{
    background-color: #11b832;
    text-align: center;
    border-radius: 4px;
    padding: 1px 3px;
    font-size: 12px;
    width: 42px;
}


.api-method.post{
    background-color: #b85711;
}

.api-name{
    width: 120px;
}

@media (prefers-color-scheme: light) {}
</style>
    