// 接口

import Axios from '@/config/axios'

/**
 * [服务器地址]
 */
const host = '/api/'
// const host = window.location.origin + '/nova/'

/**
 * [接口地址]
 */
const url = {
  '大货甘特表编辑': 'itemGanttSummaryShowAction.ndo?action=updateItemGanttSummary',
  '大货甘特表编辑提交': 'itemGanttSummarySaveAction.ndo?action=updateNodeSummary'
}

const request = function (param) {
  param.path = host + url[param.name]
  Axios(param)
}

export default request
