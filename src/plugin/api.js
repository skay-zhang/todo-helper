import axios from 'axios'

axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

const request = axios.create({
    baseURL: 'http://localhost:22333/api',
    timeout: 10000
})

request.interceptors.response.use(
    response => {
        return response.data
    }, () => {
        throw "网络异常"
    }
)

export default {
    getVersion: () => {
        return request({
            url: '/version',
            method: 'GET'
        })
    },
    getNewVersion: () => {
        return request({
            url: 'https://raw.githubusercontent.com/skay-zhang/todo-helper/main/VERSION',
            method: 'GET'
        })
    },
    updateNewVersion: () => {
        return request({
            url: '/update',
            method: 'GET'
        })
    },
    initAdd: () => {
        return request({
            url: '/add',
            method: 'GET'
        })
    },
    addMatter: form => {
        let data = new URLSearchParams();
        data.append('content', form.content);
        data.append('state', form.state);
        data.append('tag', JSON.stringify(form.tag));
        return request({
            url: '/add',
            method: 'POST',
            data
        })
    },
    getMattersNumber: form => {
        let data = new URLSearchParams();
        data.append('start', form.start);
        data.append('end', form.end);
        data.append('state', form.state);
        if (form.tag && form.tag != 'null') data.append('tag', form.tag);
        data.append('del', form.del);
        return request({
            url: '/number',
            method: 'POST',
            data
        })
    },
    getMattersList: form => {
        let data = new URLSearchParams();
        data.append('start', form.start);
        data.append('end', form.end);
        data.append('state', form.state);
        if (form.tag && form.tag != 'null') data.append('tag', form.tag);
        data.append('del', form.del);
        data.append('number', form.number);
        data.append('page', form.page);
        return request({
            url: '/list',
            method: 'POST',
            data
        })
    },
    removeMatter: (id, state) => {
        let data = new URLSearchParams();
        data.append('id', id);
        data.append('state', state);
        return request({
            url: '/item',
            method: 'DELETE',
            data
        })
    },
    updateMatterState: (id, state) => {
        let data = new URLSearchParams();
        data.append('id', id);
        data.append('state', state);
        return request({
            url: '/state',
            method: 'POST',
            data
        })
    },
    editMatter: (form) => {
        let data = new URLSearchParams();
        data.append('id', form.id);
        data.append('content', form.content);
        data.append('state', form.state);
        data.append('tag', JSON.stringify(form.tag));
        if (form.t1 && form.t1 != 'null') data.append('t1', form.t1);
        if (form.t2 && form.t2 != 'null') data.append('t2', form.t2);
        if (form.t3 && form.t3 != 'null') data.append('t3', form.t3);
        if (form.t4 && form.t4 != 'null') data.append('t4', form.t4);
        return request({
            url: '/item',
            method: 'POST',
            data
        })
    },
    cleanMatter: () => {
        return request({
            url: '/clean',
            method: 'DELETE'
        })
    },
    searchTags: keyword => {
        let data = new URLSearchParams();
        data.append('keyword', keyword);
        return request({
            url: '/tag/search',
            method: 'POST',
            data
        })
    },
    addTag: keyword => {
        let data = new URLSearchParams();
        data.append('keyword', keyword);
        return request({
            url: '/tag/add',
            method: 'POST',
            data
        })
    },
    getTagList: () => {
        return request({
            url: '/tag/list',
            method: 'GET'
        })
    },
    getStatistics: () => {
        return request({
            url: '/statistics',
            method: 'GET'
        })
    },
    exportData: () => {
        return request({
            url: '/export',
            method: 'GET'
        })
    },
    importData: () => {
        return request({
            url: '/import',
            method: 'GET'
        })
    },
}