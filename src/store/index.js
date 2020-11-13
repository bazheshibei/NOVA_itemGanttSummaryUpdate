// 组装模块并导出 store

import Vue from 'vue'
import Vuex from 'vuex'
import Tool from './tool.js' // 工具方法
import Dev from './dev.js' //   本地开发代码
import Prod from './prod.js' // 生产环境代码
Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {},

  state: {
    nowCodeType: 'Prod', //        当前代码类型
    codeObj: { Dev, Prod }, //    代码类型 { Dev: '开发', Prod: '生产' }
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
    isComputed: false, //         触发：计算属性
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
      state.isComputed = false
      // console.log('计算后的表格数据 ----- ', list)
      return list
    }
  },

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
      state.isComputed = true
    }
  },

  actions: {
    /**
     * [请求：大货甘特表编辑]
     */
    A_updateItemGanttSummary({ state, commit }) {
      state.codeObj[state.nowCodeType].A_updateItemGanttSummary(state, commit)
    },

    /**
     * [请求：大货甘特表编辑提交]
     */
    A_updateNodeSummary({ state, getters }, { audit_status }) {
      state.codeObj[state.nowCodeType].A_updateNodeSummary(state, getters, audit_status)
    }
  }

})

export default store
