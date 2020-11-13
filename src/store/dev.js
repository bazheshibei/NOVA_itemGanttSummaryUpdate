
import Tool from './tool.js'
import { MessageBox } from 'element-ui'

/**
 * 本地开发代码
 * @ [调用本地数据]
 * @ [不请求接口]
 */
const Dev = {}

/**
 * [请求：大货甘特表编辑]
 */
Dev.A_updateItemGanttSummary = function (state, commit) {
  const data = JSON.parse(localStorage.getItem('大货甘特表编辑')) || {}
  console.log('请求：大货甘特表编辑 ----- ', data)
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

/**
 * [请求：大货甘特表编辑提交]
 */
Dev.A_updateNodeSummary = function (state, getters, audit_status) {
  const { local, node_template_id } = state
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
    console.log(`请求：大货甘特表编辑提交 --- local`, local)
    console.log(`请求：大货甘特表编辑提交 --- node_template_id`, node_template_id)
    console.log(`请求：大货甘特表编辑提交 --- audit_status`, audit_status)
    console.log(`请求：大货甘特表编辑提交 --- nodeDataList`, nodeDataList)
  }
}

export default Dev
