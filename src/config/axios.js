
// 发送请求
import Axios from 'axios'
import Qs from 'qs'
import { Loading } from 'element-ui'
// import { MessageBox, Loading } from 'element-ui'

/**
 * [全局配置]
 * @cate {[headers]}      HTTP自定义请求头
 * @cate {[interceptors]} 请求拦截器
 */
Axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'
Axios.interceptors.request.use(function (config) {
  return config
})

/**
 * 请求拦截器
 */
Axios.interceptors.request.use(config => {
  /* 保存接口：附件上传 */
  if (config.url.indexOf('saveItemNodeAdjuestment') > -1) {
    const formdata = new FormData()
    config.headers = { 'Content-Type': 'multipart/form-data' }
    // console.log('config.data ----- ', config.data)
    for (const x in config.data) {
      const item = config.data[x]
      if (x === 'file') {
        /* 附件 */
        for (const y in item) {
          formdata.append(x, item[y])
        }
      } else {
        /* 一般数据 */
        formdata.append(x, item)
      }
    }
    config.data = formdata
    return config
  } else {
    config.data = Qs.stringify(config.data)
    return config
  }
})

/**
 * [发起请求]
 */
const HTTP = function (param) {
  let loadingInstance
  /* 接收参数 */
  const {
    path = '', //               接口地址
    path2 = '', //              可变参数
    obj = {}, //                参数
    suc = function (res) {}, // 成功后，回调函数
    err = function (res) {}, // 失败后，回调函数
    method = 'post', //         请求方式
    loading = '' //             loading 效果时，显示的文字
  } = param
  /* 参数 */
  const data = obj
  /* 接口地址 */
  let url = path + path2
  /* GET 方式拼接参数 */
  if (method === 'get') {
    const text = []
    for (const x in data) {
      text.push(`${x}=${data[x]}`)
    }
    url += text.length ? (url.indexOf('?') > -1 ? '&' + text.join('&') : '?' + text.join('&')) : ''
  }
  /* loading 效果 */
  if (loading) {
    loadingInstance = Loading.service({ text: loading })
  }
  /* 发起请求 */
  Axios({ method, url, data, timeout: 0 })
    .then(function (res) {
      suc(res)
      /* 以服务的方式调用的 Loading 需要异步关闭 */
      if (loading) {
        loadingInstance.close()
      }
    })
    .catch(function (res) {
      err(res)
      /* 以服务的方式调用的 Loading 需要异步关闭 */
      if (loading) {
        loadingInstance.close()
      }
    })
}

export default HTTP
