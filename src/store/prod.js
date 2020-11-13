
import Api from '@/config/api'
import Tool from './tool.js'
import { MessageBox, Loading } from 'element-ui'

/**
 * 生产环境代码
 */
const Prod = {}

Prod.A_updateItemGanttSummary = function (state, commit) {
  /* ----- 发起请求 ----- */
  const name = '大货甘特表编辑'
  // const obj = {
  //   item_id: '40289281737e3a9b01737ead59b90035',
  //   item_gantt_id: '8a8a806273ebacc10173ebb3a1a90000',
  //   item_gantt_detail_id: '4028883c74042f1e017404425dac0000'
  // }
  const obj = state.local
  const suc = function (res = {}) {
    const { data, msg, status } = res.data
    if (String(status) === '0') {
      // eslint-disable-next-line
      MessageBox({ title: '数据异常', message: msg, type: 'warning', closeOnClickModal: false, closeOnPressEscape: false, callback() { dg.close() } })
    } else {
      // console.log('请求：大货甘特表编辑 ----- ', res.data)
      // localStorage.setItem('大货甘特表编辑', JSON.stringify(res.data))
      //
      const { itemSummaryItemData, itemNodeAuditDetail, itemNodeData, item_gantt_detail_id, item_gantt_id, item_id, nodeData, node_template_id } = data
      const { returnTopData, order_time, deliver_date } = Tool.returnTopData(itemSummaryItemData)
      state.itemSummaryItemData = returnTopData //         项目信息
      state.adjusmentAuditMapList = itemNodeAuditDetail // 历史审核记录
      state.itemNodeData = itemNodeData //                 甘特表节点信息
      state.item_gantt_detail_id = item_gantt_detail_id // 项目甘特表明细主键id
      state.item_gantt_id = item_gantt_id //               项目甘特表主键id
      state.item_id = item_id //                           项目ID
      state.nodeData = nodeData //                         表头节点信息
      state.order_time = order_time //                     下单日期
      state.deliver_date = deliver_date //                 工厂交期
      state.node_template_id = node_template_id //         甘特表模板id
      commit('returnTableData')
    }
  }
  Api({ name, obj, suc, loading: '加载中...' })
}

/**
 * [请求：大货甘特表编辑提交]
 */
Prod.A_updateNodeSummary = function (state, getters, audit_status) {
  const { local, node_template_id, item_gantt_detail_id } = state
  const { tableList } = getters
  const { nodeDataList, errorArr } = Tool.returnSubmitData(tableList)
  if (errorArr.length) {
    if (local.from === 'neikong') {
      MessageBox.alert('', '请完善红框标注的节点后再保存', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定'
      })
    } else {
      MessageBox.alert(`${errorArr.join('')}`, '请完善后再提交', {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定'
      })
    }
  } else {
    /* 发起请求 */
    const name = '大货甘特表编辑提交'
    const obj = Object.assign({}, local, { node_template_id, item_gantt_detail_id, audit_status, nodeDataList: JSON.stringify(nodeDataList) })
    const suc = function (res) {
      const { msg, status } = res
      if (String(status) === '0') {
        MessageBox({ title: '数据异常', message: msg, type: 'warning', closeOnClickModal: false, closeOnPressEscape: false })
      } else {
        const loading = Loading.service({ text: String(audit_status) === '1' ? '暂存成功' : '提交成功', spinner: 'el-icon-circle-check' })
        setTimeout(() => {
          loading.close()
          // eslint-disable-next-line
          dg.close()
        }, 1000)
      }
    }
    Api({ name, obj, suc })
  }
}

export default Prod
