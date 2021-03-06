
const Tool = {}

/**
 * [description]
 * @param  {[Object]} data 顶部数据
 * @return {[Object]} data 整理后的顶部数据
 */
Tool.returnTopData = function (data = {}) {
  /* 面料 */
  const { styleBom = [] } = data
  const styleBomArr = []
  styleBom.forEach(function (item) {
    const { short_name, type_name } = item
    styleBomArr.push(`${short_name} -- ${type_name}`)
  })
  data.mianliao = styleBomArr.join('，')
  /* 工厂 */
  const { plantOrder = [] } = data
  const plantOrderArr = []
  plantOrder.forEach(function (item) {
    const arr = []
    const { short_name, employeename } = item
    arr.push(short_name)
    if (employeename && employeename !== null) {
      arr.push(employeename)
    }
    plantOrderArr.push(arr.join(' -- '))
  })
  data.gongchang = plantOrderArr.join('，')
  /* 岗位信息 */
  const { itemTeam = [] } = data
  const gangwei = []
  itemTeam.forEach(function (item) {
    const { post_name, employeename } = item
    gangwei.push(`${post_name}：${employeename}`)
  })
  data.gangwei = gangwei
  /* ----- 下单时间 ----- */
  const { order_time = '' } = data
  /* ----- 交货日期 ----- */
  const { deliver_date = '' } = data
  /* 返回 */
  return { returnTopData: data, order_time, deliver_date }
}

/**
 * [返回：表格数据]
 */
Tool.returnTableData = function (state) {
  const that = this
  const {
    local,
    itemNodeData = [], // 项目甘特表信息
    jzz_data = '{}', //   基础节点时间
    order_time, //        下单时间
    deliver_date //       客人交期
  } = state
  const itemNodeAbnormalObj = {} //               节点的调整记录
  const nodeAuditDetailObj = {} //                节点的审核记录
  const startEndDateMap = JSON.parse(jzz_data) // 全部节点时间
  itemNodeData.forEach(function (node) {
    /* 提取：调整记录 */
    const { itemNodeAbnormal = [] } = node
    itemNodeAbnormal.forEach(function (item) {
      itemNodeAbnormalObj[item.item_node_id] = item
    })
    /* 提取：审核记录 */
    const { nodeAuditDetail = [] } = node
    nodeAuditDetail.forEach(function (item) {
      nodeAuditDetailObj[item.item_node_id] = item
    })
    /* 提取：变量日期 */
    startEndDateMap['${' + node.node_code + '}'] = node.plan_enddate || node.first_plant_enddate
  })
  const returnObj = {}
  itemNodeData.forEach(function (node) {
    /* 公式初始化：公式有可能为 null */
    node.sys_clac_formula = node.sys_clac_formula === null ? '' : node.sys_clac_formula
    node.max_section_value = node.max_section_value === null ? '' : node.max_section_value
    node.min_section_value = node.min_section_value === null ? '' : node.min_section_value
    /* 计算 */
    const { plan_enddate, sys_clac_formula, max_section_value, min_section_value, submit_type } = node
    const first_plant_enddate = node.first_plant_enddate || that._returnTime(sys_clac_formula, startEndDateMap)
    const now = node.time || plan_enddate || first_plant_enddate
    const max = that._returnTime(max_section_value, startEndDateMap)
    const min = that._returnTime(min_section_value, startEndDateMap)
    const { status, maxMinText, show_1, show_2 } = that._isError(max, min, now, order_time, deliver_date)
    node.error = (node.node_content_type === 'content') ? false : status
    node.maxMinText = maxMinText
    node.first_plant_enddate = first_plant_enddate
    node.time = now
    node.min_plant_enddate = show_1
    node.max_plant_enddate = show_2
    if (now === '' && String(submit_type) === '1') { // 时间 === '' && 系统计算
      node.otherType = 1
    }
    /* 合并属性 */
    const obj_1 = nodeAuditDetailObj[node.item_node_id] || {}
    const obj_2 = itemNodeAbnormalObj[node.item_node_id] || {}
    node = Object.assign({}, node, obj_1, obj_2)
    node.text = node.change_remaark || ''
    /* 赋值 */
    returnObj[node.node_id] = Object.assign({}, node)
  })
  /* 返回 */
  const arr = []
  if (local.from === 'neikong') {
    arr.push(Object.assign({}, returnObj, { count: 3, rowType: 1 }))
  } else {
    arr.push(Object.assign({}, returnObj, { count: 3, rowType: 1 }))
    arr.push(Object.assign({}, returnObj, { count: 0, rowType: 2 }))
    arr.push(Object.assign({}, returnObj, { count: 0, rowType: 3 }))
  }
  return arr
}

/**
 * [返回：计算后的表格数据]
 */
Tool.returnTableList = function (state) {
  const {
    tableData = [], //     合并后的表格数据
    isComputed = false, // 是否可以重新计算
    changeIndexId = '', // 修改的数据索引及节点ID、节点名称 '4_2c9xadw244_毛条到厂'
    order_time, //         接口：下单时间
    deliver_date //        接口：交货日期
  } = state
  const that = this
  if (isComputed) {
    const [itemIndex, nodeId, nodeName] = changeIndexId.split('_')
    /* ----- 处理当前节点 ----- */
    tableData.map(function (item, index) {
      if (index === parseInt(itemIndex)) {
        /* 提取：节点：日期 */
        const nodeCodeObj = Object.assign({}, JSON.parse(item.jzz_data || '{}'))
        for (const x in item) {
          const node = item[x]
          if (node instanceof Object && (node.node_id || node.node_code)) {
            const { time, node_code } = node
            if (time && time !== '/') {
              nodeCodeObj['${' + node_code + '}'] = time
            }
          }
        }
        /* 改变的：{ 节点名称, code, 是否根据当前节点的时间去计算其他节点 } */
        const { node_code, node_content_type, isComputedOther } = item[nodeId]
        if (isComputedOther && node_content_type === 'time') {
          /* ----- 计算：根据当前节点计算其他节点 ----- */
          for (const x in item) {
            const node = item[x]
            if (node instanceof Object && (node.node_id || node.node_code) && x === nodeId) { // 自身节点
              /* 自身：验证是否报错 */
              const { node_code, time, max_plant_enddate, min_plant_enddate } = node
              const { status, maxMinText } = that._isError(max_plant_enddate, min_plant_enddate, time, order_time, deliver_date)
              // node.change_remaark = (status || otherType === 1) ? node.change_remaark : ''
              node.error = (node.node_content_type === 'content') ? false : status
              node.maxMinText = maxMinText
              nodeCodeObj['${' + node_code + '}'] = time
            }
          }
          for (const x in item) {
            const node = item[x]
            if (node instanceof Object && (node.node_id || node.node_code) && x !== nodeId) { // 其他节点
              /* 引用到此节点的其他节点：重新计算 */
              const { sys_clac_formula, max_section_value, min_section_value, submit_type, time } = node
              const proving_1 = sys_clac_formula.indexOf('${' + node_code + '}') > -1 //  引用了此节点：自身公式
              const proving_2 = max_section_value.indexOf('${' + node_code + '}') > -1 // 引用了此节点：最大值公式
              const proving_3 = min_section_value.indexOf('${' + node_code + '}') > -1 // 引用了此节点：最小值公式
              if (proving_1 || proving_2 || proving_3) {
                const now = that._returnTime(sys_clac_formula, nodeCodeObj)
                const max = that._returnTime(max_section_value, nodeCodeObj)
                const min = that._returnTime(min_section_value, nodeCodeObj)
                const { status, maxMinText, show_1, show_2 } = that._isError(max, min, now, order_time, deliver_date)
                node.min_plant_enddate = show_1
                node.max_plant_enddate = show_2
                node.maxMinText = maxMinText
                if (proving_1 && time !== '/') { // 引用了此节点 && 当前节点不是'/'
                  node.time = now
                  node.change_plan_time = now
                  // node.change_remaark = status ? `${nodeName} 节点变更后，重新计算` : ''
                  node.change_remaark = `${nodeName} 节点变更后，重新计算`
                  node.error = (node.node_content_type === 'content') ? false : status
                  if (now === '' && String(submit_type) === '1') { // 时间 === '' && 系统计算
                    node.otherType = 1
                  } else {
                    node.otherType = 0
                  }
                }
              }
            }
          }
        } else if (!isComputedOther && node_content_type === 'time') {
          /* 重置：当前节点时间 */
          const { node_code, plan_enddate } = item[nodeId]
          nodeCodeObj['${' + node_code + '}'] = plan_enddate
          /* ----- 还原：根据当前节点计算其他节点 ----- */
          for (const x in item) {
            const node = item[x]
            if (node instanceof Object && (node.node_id || node.node_code) && x !== nodeId) { // 其他节点
              /* 引用到此节点的其他节点：重新计算 */
              const { plan_enddate, sys_clac_formula, max_section_value, min_section_value, submit_type } = node
              const proving_1 = sys_clac_formula.indexOf('${' + node_code + '}') > -1 //  引用了此节点：自身公式
              const proving_2 = max_section_value.indexOf('${' + node_code + '}') > -1 // 引用了此节点：最大值公式
              const proving_3 = min_section_value.indexOf('${' + node_code + '}') > -1 // 引用了此节点：最小值公式
              if (proving_1 || proving_2 || proving_3) {
                const now = plan_enddate
                const max = that._returnTime(max_section_value, nodeCodeObj)
                const min = that._returnTime(min_section_value, nodeCodeObj)
                const { status, maxMinText, show_1, show_2 } = that._isError(max, min, now, order_time, deliver_date)
                node.time = now
                node.change_plan_time = now
                node.change_remaark = node.text || ''
                node.min_plant_enddate = show_1
                node.max_plant_enddate = show_2
                node.error = (node.node_content_type === 'content') ? false : status
                node.maxMinText = maxMinText
                if (now === '' && String(submit_type) === '1') { // 时间 === '' && 系统计算
                  node.otherType = 1
                } else {
                  node.otherType = 0
                }
              }
            }
          }
        }
      }
    })
  }
  return tableData
}

/**
 * [返回：提交用的数据]
 * @param  {[Array]}  tableList    表格数据
 * @return {[Array]}  nodeDataList 整理好的数据
 * @return {[Array]}  errorArr     报错信息
 */
Tool.returnSubmitData = function (tableList) {
  const nodeDataList = []
  const errorArr = []
  let haveBlankNode = false // 是否存在空节点
  tableList.forEach(function (data, dataIndex) {
    if (data.count > 0) { // 处理行：计划完成
      for (const x in data) {
        const node = data[x]
        /* 从 节点对象 提取数据 */
        if (node instanceof Object && node.node_id) {
          const {
            plan_enddate, //            节点预计完成时间
            item_node_id, //            项目节点id
            node_id, //                 节点id
            first_plant_enddate, //     预计完成时间
            min_plant_enddate, //       最小值
            max_plant_enddate, //       最大值
            item_team_id, //            负责岗位id
            node_template_detail_id, // 节点模板明细id
            node_content_type,
            error,
            is_change, //               是否调整
            time: change_plan_time, //  调整后时间
            time,
            verification_remark, //     异常原因
            frist_plan_time, //         首次提报日期
            change_remaark, //          调整/异常说明
            text,
            otherType
          } = node
          const nodeObj = { item_node_id, node_id, node_content_type, first_plant_enddate: change_plan_time, min_plant_enddate, max_plant_enddate, item_team_id, node_template_detail_id }
          const item_node_change = { frist_plan_time, verification_remark, is_change, change_plan_time, change_remaark }
          /* ----- 验证 ----- */
          const before = plan_enddate || first_plant_enddate
          if (!time) { /* 报错：时间为空 */
            haveBlankNode = true
            break
          }
          const submit_1 = before !== time && ((change_remaark && error) || !error) // 提交：时间有变化 && ((有现在异常原因 && 报错) || 不报错))
          const submit_2 = before === time && error && change_remaark !== text //      提交：时间没变 && 报错 && 异常原因变了
          const submit_3 = otherType === 1 && change_remaark //                        提交：计算为空的系统计算节点 && 有异常原因
          const err_1 = before !== time && error && !change_remaark //                 报错：时间有变化 && 报错 && 没有异常原因
          const err_2 = otherType === 1 && !change_remaark //                          报错：计算为空的系统计算节点 && 没有异常原因
          if (submit_1 || submit_2 || submit_3) { /* 提交 */
            nodeObj.item_node_change = item_node_change
            nodeObj.is_adjustment = 1 // 是否手动修改过
            nodeDataList.push(nodeObj)
          } else if (err_1 || err_2) { /* 报错 */
            errorArr.push(`<p>第 ${dataIndex + 1} 行 ${node.node_name} 需要填写异常原因</p>`)
          }
        }
      }
    }
  })
  if (haveBlankNode) {
    errorArr.push('<p>请完善全部节点后再提交</p>')
  }
  if (!nodeDataList.length && !errorArr.length) {
    errorArr.push('<p>节点时间未变更，请修改时间后再提交</p>')
  }
  return { nodeDataList, errorArr }
}

/** --------------------------- 工具方法 --------------------------- **/

/**
 * [公式 转 时间]
 * @param {[String]} str         公式
 * @param {[Object]} nodeCodeObj 当前项目的节点值 { ${变量}: 自身时间 }
 */
Tool._returnTime = function (str = '', nodeCodeObj = {}) {
  const asd = str.replace(/\$\{[\w-_:/]+\}/g, function (name) {
    return nodeCodeObj[name] ? new Date(nodeCodeObj[name]).getTime() : 'xxx'
  })
  const numStr = asd.replace(/[0-9]+/g, function (num, index) {
    if (num.length < 13) {
      let isChange = true
      let beforeStr = ''
      let afterStr = ''
      let numStr = 0
      if (index !== 0) {
        beforeStr = asd[index - 1]
      }
      if (index + num.length !== asd.length) {
        afterStr = asd[index + num.length]
      }
      if (beforeStr === '*' || beforeStr === '/' || afterStr === '*' || afterStr === '/') {
        isChange = false
      }
      numStr = num
      if (isChange) {
        numStr = parseInt(numStr) * 60 * 60 * 24 * 1000
      }
      return `${numStr}`
    } else {
      return num
    }
  })
  /* 毫秒数 转 时间 */
  try {
    // eslint-disable-next-line
    const timeStr = eval(numStr)
    if (isNaN(timeStr)) {
      return ''
    } else if (new Date(timeStr).getTime() < new Date('2000-01-01').getTime()) {
      return ''
    } else {
      const d = new Date(timeStr)
      const year = d.getFullYear()
      const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
      const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
      return `${year}-${month}-${day}`
    }
  } catch (err) {
    return ''
  }
}
/**
 * [转换：处理时间格式]
 * @param {[String]} time 时间
 */
Tool._toggleTime = function (time) {
  if (time === '/') {
    return time
  } if (time) {
    const [three, two, one] = time.split(/[-//.]/g).reverse()
    /* 处理：年 */
    let year = parseInt(new Date().getFullYear()) // 年 {[Int]}
    if (!isNaN(parseInt(one))) {
      const str = String(one).trim()
      year = parseInt(String(year).slice(0, -1 * str.length) + str)
    }
    /* 处理：月 */
    let addYear = 0 // 增加的年份 {[Int]}
    let month = (isNaN(parseInt(two)) || two === '0') ? 1 : parseInt(two) // 月 {[Int]}
    for (let i = 0; ; i++) {
      if (month > 12) {
        addYear++
        month -= 12
      } else {
        break
      }
    }
    year = year + addYear
    /* 处理：日 */
    let year_2 = month < 12 ? year : year + 1
    let month_2 = month < 12 ? month + 1 : month + 1 - 12
    let day = (isNaN(parseInt(three)) || Number(three) === 0) ? 1 : parseInt(three) // 日 {[Int]}
    for (let i = 0; ; i++) {
      const maxDay = new Date(new Date(`${year_2}-${month_2}`).getTime() - 1000 * 60 * 60 * 24).getDate()
      if (day > maxDay) {
        day -= maxDay
        month++
        month_2++
        if (month > 12) {
          month -= 12
          year += 1
          year_2 += 1
        }
        if (month_2 > 12) {
          month_2 -= 12
        }
      } else {
        break
      }
    }
    /* 整合 */
    return `${year}-${'00'.slice(0, -1 * String(month).length) + month}-${'00'.slice(0, -1 * String(day).length) + day}`
  } else {
    return ''
  }
}
/**
 * [验证：计划事件是否在区间内]
 * @param {[String]} maxVal       最大值
 * @param {[String]} minVal       最小值
 * @param {[String]} plantVal     计划时间
 * @param {[String]} order_time   下单日期
 * @param {[String]} deliver_date 客人交期
 */
Tool._isError = function (maxVal = '', minVal = '', plantVal = '', order_time = '', deliver_date = '') {
  const max = isNaN(new Date(maxVal).getTime()) ? 0 : new Date(maxVal).getTime() //                 最大值
  const min = isNaN(new Date(minVal).getTime()) ? 0 : new Date(minVal).getTime() //                 最小值
  const plant = isNaN(new Date(plantVal).getTime()) ? 0 : new Date(plantVal).getTime() //           计划时间
  const order = isNaN(new Date(order_time).getTime()) ? 0 : new Date(order_time).getTime() //       下单日期
  const deliver = isNaN(new Date(deliver_date).getTime()) ? 0 : new Date(deliver_date).getTime() // 客人交期
  const countMax = deliver && deliver <= max ? deliver : max
  const countMin = order && min <= order ? order : min
  const time_1 = this._returnYearMonthDay(countMin)
  const time_2 = this._returnYearMonthDay(countMax)
  const alert_1 = time_1 === '1970-01-01' ? '未知' : time_1 // 提示文字：最小值
  const alert_2 = time_2 === '1970-01-01' ? '未知' : time_2 // 提示文字：最大值
  const show_1 = time_1 === '1970-01-01' ? '' : time_1 //     展示时间：最小值
  const show_2 = time_2 === '1970-01-01' ? '' : time_2 //     展示时间：最大值
  const maxMinText = `最早：${alert_1}，最晚：${alert_2}`
  /* 返回 */
  if (countMin && countMax && (countMin <= plant && plant <= countMax)) { // 在区间内
    return { status: false, maxMinText, show_1, show_2 }
  } else if (countMin && !countMax && countMin <= plant) { //                只有最小值 && 大于最小值
    return { status: false, maxMinText, show_1, show_2 }
  } else if (!countMin && countMax && plant <= countMax) { //                只有最大值 && 小于最大值
    return { status: false, maxMinText, show_1, show_2 }
  } else {
    return { status: true, maxMinText, show_1, show_2 }
  }
}
/**
 * [提取：年月日]
 */
Tool._returnYearMonthDay = function (strOrNum) {
  const d = new Date(strOrNum)
  const year = d.getFullYear()
  const month = d.getMonth() + 1 < 10 ? '0' + (d.getMonth() + 1) : d.getMonth() + 1
  const day = d.getDate() < 10 ? '0' + d.getDate() : d.getDate()
  return `${year}-${month}-${day}`
}

export default Tool
