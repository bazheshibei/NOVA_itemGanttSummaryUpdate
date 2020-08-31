// 组装模块并导出 store

import Vue from 'vue'
import Vuex from 'vuex'
import Api from '@/config/api'
import Tool from './tool.js'
import { MessageBox } from 'element-ui'
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {},

  mutations: {
    /**
     * [保存数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    saveData(state, params) {
      const { name, obj } = params
      state[name] = obj
    },
    /**
     * [添加数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    assignData(state, params) {
      const { name, obj } = params
      const data = state[name] || {}
      state[name] = Object.assign({}, data, obj)
    },
    /**
     * [添加数据]
     * @param {[String]} name 属性名
     * @param {[Object]} obj  属性值
     */
    pushData(state, params) {
      const { name, obj } = params
      obj.forEach(function (item) {
        state[name].push(item)
      })
    },
    /**
     * [返回：表格数据]
     */
    returnTableData(state) {
      const list = Tool.returnTableData(state)
      // console.log('list ----- ', list)
      state.tableData = list
      /* 触发：计算属性 */
      state.computedTime = true
    }
  },

  state: {
    /* 本地缓存 */
    local: {},
    /* 初始化 */
    itemSummaryItemData: {}, //   项目信息
    adjusmentAuditMapList: [], // 历史审核记录
    itemNodeData: '', //          甘特表节点信息
    item_gantt_detail_id: '', //  项目甘特表明细主键id
    item_gantt_id: '', //         项目甘特表主键id
    item_id: '', //               项目ID
    nodeData: [], //              表头节点信息
    order_time: '', //            下单日期
    deliver_date: '', //          工厂交期
    node_template_id: '', //      甘特表模板id
    /* 计算依据 */
    computedTime: false, //       触发：计算属性
    changeIndexId: '', //         修改的数据索引及节点ID '4_2c9xadw244'
    /* 整合后的基础数据（更新新模板 || 不更新） */
    tableData: []
  },

  getters: {
    /**
     * [计算后的表格数据]
     */
    tableList(state) {
      const list = Tool.returnTableList(state)
      state.computedTime = false
      // console.log('计算后的表格数据 ----- ', list)
      return list
    }
  },

  actions: {
    /**
     * [请求：大货甘特表编辑]
     */
    A_updateItemGanttSummary({ state, commit }) {
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

      // /* ----- 发起请求 ----- */
      // const name = '大货甘特表编辑'
      // const obj = state.local
      // const suc = function (res = {}) {
      //   const { data, msg, status } = res
      //   if (String(status) === '0') {
      //     // eslint-disable-next-line
      //     MessageBox({ title: '数据异常', message: msg, type: 'warning', closeOnClickModal: false, closeOnPressEscape: false, callback() { dg.close() } })
      //   } else {
      //     // console.log('请求：大货甘特表编辑 ----- ', res.data)
      //     // localStorage.setItem('大货甘特表编辑', JSON.stringify(res.data))
      //     //
      //     const { itemSummaryItemData, itemNodeAuditDetail, itemNodeData, item_gantt_detail_id, item_gantt_id, item_id, nodeData, node_template_id } = data
      //     const { returnTopData, order_time, deliver_date } = Tool.returnTopData(itemSummaryItemData)
      //     state.itemSummaryItemData = returnTopData //         项目信息
      //     state.adjusmentAuditMapList = itemNodeAuditDetail // 历史审核记录
      //     state.itemNodeData = itemNodeData //                 甘特表节点信息
      //     state.item_gantt_detail_id = item_gantt_detail_id // 项目甘特表明细主键id
      //     state.item_gantt_id = item_gantt_id //               项目甘特表主键id
      //     state.item_id = item_id //                           项目ID
      //     state.nodeData = nodeData //                         表头节点信息
      //     state.order_time = order_time //                     下单日期
      //     state.deliver_date = deliver_date //                 工厂交期
      //     state.node_template_id = node_template_id //         甘特表模板id
      //     commit('returnTableData')
      //   }
      // }
      // Api({ name, obj, suc, loading: '加载中...' })
    },

    /**
     * [请求：大货甘特表编辑提交]
     */
    A_updateNodeSummary({ state, getters }, { audit_status }) {
      const { local, node_template_id } = state
      const { tableList } = getters
      const { nodeDataList, errorArr } = Tool.returnSubmitData(tableList)
      if (errorArr.length) {
        MessageBox.alert(`${errorArr.join('')}`, '请完善后再提交', {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '确定'
        })
      } else {
        // console.log('提交时的节点数据 ----- ', nodeDataList, local, node_template_id)
        /* 发起请求 */
        const name = '大货甘特表编辑提交'
        const obj = Object.assign({}, local, { node_template_id, audit_status, nodeDataList })
        const suc = function (res) {
          // console.log('大货甘特表编辑提交 --- 结果', res)
          const { msg, status } = res
          if (String(status) === '0') {
            MessageBox({ title: '数据异常', message: msg, type: 'warning', closeOnClickModal: false, closeOnPressEscape: false })
          } else {
            // eslint-disable-next-line
            dg.close()
          }
        }
        Api({ name, obj, suc })
      }
    }
  }

})

export default store
