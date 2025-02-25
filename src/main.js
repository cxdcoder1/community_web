import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import axios from 'axios'
import 'element-ui/lib/theme-chalk/index.css';
import 'e-icon-picker/lib/index.css'; // 基本样式，包含基本图标
import iconPicker from 'e-icon-picker';
import "./assets/fonts/iconfont/iconfont.css"
import {MessageBox} from 'element-ui'
import 'e-icon-picker/lib/index.css';
import {analyzingIconForIconfont} from "e-icon-picker/src/utils";//引入解析json函数
import iconfont from "./assets/fonts/iconfont/iconfont.json" //解析class
import geoJson from '@/components/utils/china.json'
import * as echarts from 'echarts'
import dataV from '@jiaminghi/data-view'


Vue.prototype.$echarts = echarts
Vue.use(dataV)
echarts.registerMap('china', geoJson);

import ElementUI from 'element-ui';
// import {error} from "@babel/eslint-parser/lib/convert"; //解析class


let forIconfont = analyzingIconForIconfont(iconfont)


Vue.use(iconPicker, {addIconList: forIconfont.list}, router,ElementUI);


//接口前缀
axios.defaults.baseURL = 'http://localhost:8080/'
//请求在到达服务器之前，先会调用use中的这个回调函数来添加请求头信息
axios.interceptors.request.use(config => {
    //为请求头对象，添加token验证的Authorization字段
    config.headers.Authorization = window.sessionStorage.getItem("token")
    return config
})

//响应拦截器
axios.interceptors.response.use(function (response) {

    let isMessageBoxDisplayed = false;

    if (response.status == '204' && !isMessageBoxDisplayed) {
        try {
            isMessageBoxDisplayed = true;
            window.sessionStorage.clear();
            window.localStorage.clear();
            MessageBox('签名过期,点击重新登录').then(() => {
                window.location.href = '/login';
            }).catch(() => {
                window.location.href = '/login';
            })
        }catch {
            console.log('err')
            // console.log(error.message)
        }
    }

    window.sessionStorage.setItem('token', response.headers.token);
    console.log(response);
    return response;
}, function (error) {
    return error;
})
Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.prototype.$messagebox = MessageBox

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')

Vue.filter('dateFormat', function(value) {
  // 自定义日期格式化逻辑
  const date = new Date(value);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
});

