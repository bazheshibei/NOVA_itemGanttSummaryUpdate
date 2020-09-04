
<!-- 模块：表格 -->

<template>
  <div class="comTableBox">
    <div class="comTableTitle">
      <span>节点信息</span>
    </div>

    <el-table class="comTable" :data="tableList" size="mini" border>
      <!-- 计划完成 || 本次调整 -->
      <el-table-column label="" width="100" fixed>
        <template slot-scope="scope">
          <p v-if="scope.row.rowType === 1">计划完成</p>
          <p v-if="scope.row.rowType === 2">本次调整</p>
          <p v-if="scope.row.rowType === 3">审批调整</p>
        </template>
      </el-table-column>

      <!-- 循环节点 -->
      <div v-for="(val, key) in nodeData" :key="'node_' + key">
        <el-table-column v-for="(item, index) in val" :key="index" :label="item" width="150">
          <template slot-scope="scope">
            <div v-if="scope.row[index]">
              <div v-if="scope.row.rowType === 1">
                <!-- 计划完成 -->
                <div>
                  <el-popover popper-class="comPopover" :visible-arrow="false" placement="top" trigger="hover" :content="scope.row[index].maxMinText">
                    <div slot="reference" v-if="scope.row[index].submit_type === 2">
                      <el-input class="comInput" size="mini" placeholder="请输入日期"
                        :class="scope.row[index].error ? 'errorInput' : ''" v-model="scope.row[index].time"
                        @blur="blur_table(scope.$index, index, $event, item)"
                      ></el-input>
                    </div>
                    <span class="hover" slot="reference" v-else @click="edit(scope.$index, index, item)">
                      <span :class="scope.row[index].error ? 'red' : ''">{{scope.row[index].time}}</span>
                      <i class="el-icon-warning warningIcon" v-if="scope.row[index].error"></i>
                    </span>
                  </el-popover>
                </div>
              </div>
              <!-- 本次调整 -->
              <div v-else-if="scope.row.rowType === 2">
                <div v-if="scope.row[index].submit_type === 2 && scope.row[index].error">
                  <el-input class="comInput" :class="scope.row[index].error ? 'errorInput' : ''" placeholder="请输入异常原因"
                    v-model="scope.row[index].change_remaark" size="mini"
                  ></el-input>
                </div>
                <div style="text-align: left;" v-if="scope.row[index].submit_type !== 2">
                  <p v-if="scope.row[index].change_plan_time">调整后：{{scope.row[index].change_plan_time || '未调整'}}</p>
                  <p v-if="scope.row[index].change_remaark">原因：{{scope.row[index].change_remaark}}</p>
                </div>
              </div>
              <!-- 审批调整 -->
              <div v-else-if="scope.row.rowType === 3">
                <div style="text-align: left;">
                  <p v-if="scope.row[index].final_audit_plan_enddate">调整后：{{scope.row[index].final_audit_plan_enddate}}</p>
                  <p v-if="scope.row[index].audit_process_record">原因：{{scope.row[index].audit_process_record}}</p>
                </div>
              </div>
            </div>
            <span v-else></span>
          </template>
        </el-table-column>
      </div>

    </el-table>

    <!-- 弹出层 -->
    <el-dialog class="comDialog" :title="d_data.title" :visible.sync="dialogVisible" width="80%" :close-on-click-modal="false" :close-on-press-escape="false">
      <!-- 弹出层：表单 -->
      <div class="lineBox">
        <div class="lineLabel">当前节点：</div>
        <div class="lineText">{{d_data.node_name}}</div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">系统计算日期：</div>
        <div class="lineText">{{d_data.plan_enddate}}</div>
        <div class="lineLabel">异常原因：</div>
        <div class="lineText">{{d_data.verification_remark}}</div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">是否调整日期：</div>
        <div class="lineText">
          <el-radio v-model="d_data.is_change" :label="1" @change="isChangeTime">是</el-radio>
          <el-radio v-model="d_data.is_change" :label="0" @change="isChangeTime">否</el-radio>
        </div>
        <div class="lineLabel">调整后日期：</div>
        <div class="lineText">
          <el-input class="comInput" :class="d_data.error && d_data.is_change === 1 ? 'errorInput' : ''" slot="reference" size="mini" placeholder="请输入日期"
            :disabled="d_data.is_change === 0 ? true : false"
            v-model="d_data.change_plan_time" @blur="blur_dialog('change_plan_time')"
          ></el-input>
        </div>
      </div>
      <div class="lineBox">
        <div class="lineLabel">日期最小值：</div>
        <div class="lineText">
          {{d_data.min_plant_enddate}}
        </div>
        <div class="lineLabel">日期最大值：</div>
        <div class="lineText">
          {{d_data.max_plant_enddate}}
        </div>
      </div>
      <div class="lineBox">
        <div class="lineLabel"><span class="red">*&nbsp;</span>调整/异常原因：</div>
        <div class="lineText">
          <el-input class="comInput2" v-model="d_data.change_remaark" size="mini" placeholder="请填写调整/异常原因"></el-input>
        </div>
      </div>
      <div class="lineBox" v-if="d_data.is_change === 1">
        <div class="lineLabel" style="width: auto;">&nbsp;&nbsp;&nbsp;是否根据当前节点的时间去计算其他节点：</div>
        <div class="lineText">
          <el-radio v-model="d_data.isComputedOther" :label="true">是</el-radio>
          <el-radio v-model="d_data.isComputedOther" :label="false">否</el-radio>
        </div>
      </div>
      <!-- 弹出层：按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button size="mini" @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" size="mini" @click="submit(d_data.title)">保 存</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import Tool from '../../../store/tool.js'
import { mapState, mapGetters } from 'vuex'
export default {
  data() {
    return {
      /* 弹出层 */
      dialogVisible: false, // 弹出层：是否显示
      d_data: {} //            弹出层：数据
    }
  },
  computed: {
    ...mapState(['nodeData', 'order_time', 'deliver_date']),
    ...mapGetters(['tableList'])
  },
  methods: {
    /**
     * [失焦：表格input]
     * @param {[Int]}    index    表格行索引
     * @param {[String]} nodeId   节点ID
     * @param {[Object]} event    事件对象
     * @param {[String]} nodeName 节点名称
     */
    blur_table(index, nodeId, event, nodeName) {
      // plan_enddate 计划时间
      let value = Tool._toggleTime(event.target.value)
      const node = this.tableList[index][nodeId]
      const { is_quote, plan_enddate } = node
      if ((is_quote === 1 && (!value || value === '/'))) {
        /* 报错还原：被引用 && （'' || '/'） */
        this.$message.error('此节点被其他节点引用，不可为空或/')
        value = ''
      }
      const is_change = plan_enddate !== value ? 1 : 0
      node.is_change = is_change
      node.time = value
      node.change_plan_time = is_change === 1 ? value : ''
      node.isComputedOther = true
      this.$store.commit('saveData', { name: 'changeIndexId', obj: `${index}_${nodeId}_${nodeName}` })
      this.$store.commit('saveData', { name: 'isComputed', obj: true })
    },
    /**
     * [弹出层：修改]
     * @param {[Int]}    index    行索引
     * @param {[String]} nodeId   节点ID
     * @param {[String]} nodeName 节点名称
     */
    edit(index, nodeId, nodeName) {
      const { order_time, deliver_date } = this
      const row = this.tableList[index]
      const { error, plan_enddate, time, change_remaark, is_change, isComputedOther = false, time: change_plan_time, verification_remark, max_plant_enddate, min_plant_enddate, is_quote } = row[nodeId]
      /* 赋值 */
      const d_data = {
        index, //               行索引
        order_time, //          下单日期
        deliver_date, //        客人交期
        title: '节点调整', //    弹出层标题
        nodeId, //              节点ID
        error, //               是否报错
        node_name: nodeName, // 当前异常节点
        nodeName, //            节点名称
        plan_enddate, //        系统计算日期
        time, //                当前日期
        verification_remark, // 异常原因
        max_plant_enddate, //   日期最大值
        min_plant_enddate, //   日期最小值
        is_change, //           是否调整日期
        isComputedOther, //     是否根据当前节点的时间去计算其他节点
        is_quote, //            是否被其他节点引用进行计算1是0否
        change_plan_time, //    调整后日期
        change_remaark //       调整/异常原因
      }
      this.d_data = d_data
      this.dialogVisible = true
    },
    /**
     * [弹出层：是否调整日期]
     */
    isChangeTime(event) {
      if (event === 0) {
        this.d_data.isComputedOther = false
        this.blur_dialog('plan_enddate')
      }
    },
    /**
     * [弹出层：日期失焦]
     * @param {[String]} name 属性名 { change_plan_time: '调整，日期失焦', plan_enddate: '不调整，日期还原' }
     */
    blur_dialog(name) {
      const { d_data } = this
      const { max_plant_enddate, min_plant_enddate, order_time, deliver_date, is_quote } = d_data
      const time = Tool._toggleTime(d_data[name])
      const { status } = Tool._isError(max_plant_enddate, min_plant_enddate, time, order_time, deliver_date)
      this.d_data.time = time
      this.d_data.error = (is_quote === 1 && time === '/') ? true : status
      this.d_data.change_plan_time = name === 'change_plan_time' ? time : ''
    },
    /**
     * [弹出层：保存]
     */
    submit(title) {
      const { d_data, tableList } = this
      const { index, error, nodeId, time, change_remaark, is_change, change_plan_time, is_quote, isComputedOther, nodeName, plan_enddate } = d_data
      /* 报错：报错 && 没写'调整/异常原因' */
      if (error && !change_remaark) {
        this.$message({ showClose: true, message: '请填写 调整/异常原因 后再保存', type: 'warning' })
        return false
      }
      /* 报错：变更 && 被引用 && （时间 === '' || 时间 === '/'） */
      if (is_change === 1 && is_quote === 1 && (change_plan_time === '' || change_plan_time === '/')) {
        this.$message({ showClose: true, message: '此节点被其他节点引用，不能为空或/', type: 'warning' })
        return false
      }
      /* 报错：变更 && （没写时间 || 系统计算时间 === 当前时间） */
      if (is_change === 1 && (!change_plan_time || plan_enddate === change_plan_time)) {
        this.$message({ showClose: true, message: '请修改 调整日期 后再保存', type: 'warning' })
        return false
      }
      /* ----- 保存 ----- */
      const node = tableList[index][nodeId]
      node.time = change_plan_time
      node.change_plan_time = change_plan_time
      node.is_change = is_change
      node.change_remaark = change_remaark
      node.isComputedOther = isComputedOther
      node.error = error
      if (is_change === 0) {
        node.time = time
        node.change_plan_time = ''
      }
      this.$store.commit('saveData', { name: 'changeIndexId', obj: `${index}_${nodeId}_${nodeName}` })
      this.$store.commit('saveData', { name: 'isComputed', obj: true })
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.comTableBox {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.comTable {
  border-top: 0;
}
.comTableTitle {
  color: #409EFF;
  font-size: 14px;
  padding: 10px;
  background: #ecf5ff;
  flex: 1;
}

/*** 表格容器 ***/
.tableP {
  text-align: left;
}
.tableInput {
  width: 100%;
}
.tableSelect {
  width: 100px;
}
.comInput {
  width: 125px;
  margin: 2px 0;
}
.warningIcon { /* 报错 */
  color: #F56C6C;
  font-size: 16px;
}
.red {
  color: #F56C6C;
}
.hover {
  cursor: pointer;
}
.editIcon { /* 编辑图标 */
  color: #409EFF;
  font-size: 14px;
}

/*** 弹出层 ***/
.lineBox {
  font-size: 12px;
  border-bottom: 1px solid #E4E7ED;
  border-left: 1px solid #E4E7ED;
  display: flex;
  align-items: center;
  flex: 1;
}
.lineBox:first-child {
  border-top: 1px solid #E4E7ED;
}
.lineLabel {
  width: 110px;
  min-width: 110px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.lineText {
  min-height: 35px;
  padding: 0 6px;
  border-right: 1px solid #E4E7ED;
  display: flex;
  align-items: center;
  flex: 1;
}
.comInput2 {
  flex: 1;
}

/*** 角标 ***/
.badge {
  font-size: 6px;
  position: absolute;
  top: 2px;
  right: -50px;
  transform: rotate(35deg);
  transform-origin: center;
  color: #ffffff;
  font-size: 10px;
  line-height: 16px;
  background: #C0C4CC;
  padding: 0 50px;
}
</style>

<style>
/*** 输入框：报错 ***/
.errorInput > input {
  color: #F56C6C !important;
  border-color: #F56C6C !important;
}

/*** 表格 ***/
.comTable td {
  overflow: hidden !important;
}
</style>
