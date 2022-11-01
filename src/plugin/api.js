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
    initAdd: () => {
        return request({
            url: '/add',
            method: 'GET'
        })
    },
    addMatters: form => {
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
        data.append('tag', form.tag);
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
        data.append('tag', form.tag);
        data.append('del', form.del);
        data.append('number', form.number);
        data.append('page', form.page);
        return request({
            url: '/list',
            method: 'POST',
            data
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
    }
}